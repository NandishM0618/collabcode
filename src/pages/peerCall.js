import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import {
  useLocation,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";
import { Peer } from "peerjs";
import Editor from "../components/codeeditor";
import DrawingPad from "../components/drawinpad";
import {
  MdCallEnd,
  MdOutlineScreenShare,
  MdOutlineStopScreenShare,
} from "react-icons/md";
import Chat from "../components/chat";
import Info from "../components/info";
const server = "http://localhost:5000/";

const server_host = "localhost";

const PeerCall = () => {
  const location = useLocation();
  const history = useNavigate();
  const { roomId } = useParams();

  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [infoSideOpen, setinfoSideOpen] = useState(false);

  const myName = location.state?.userName;

  // const myConns = new Map()
  const [myConns, setMyConns] = useState(new Map());
  const [mycalls, setMyCalls] = useState(new Set());
  const idName = new Map();

  var peer = null;
  var dataStream = null;
  var screenStream = null;
  var myPeerId;
  var timer;

  const [allPeers, setAllPeers] = useState([]);
  const [stream, setstream] = useState(null);

  const [lang, setLang] = useState("javascript");
  const [chatState, setChatState] = useState(false);
  const [displayCheck, setDisplayCheck] = useState(false);
  const [sirId, setsirId] = useState(null);
  const myVideo = useRef();
  const [code, setcode] = useState('console.log("Hello World");');

  const toggleVideo = () => {
    setVideoOn(!videoOn);
  };

  const toggleAudio = () => {
    setAudioOn(!audioOn);
  };

  useEffect(() => {
    navigator?.mediaDevices
      ?.getUserMedia({ video: videoOn, audio: audioOn })
      .then((videoStream) => {
        dataStream = videoStream;
        setstream(videoStream);
        init(videoStream);
      })
      .catch((error) => {
        console.log(error);

        return <Navigate to="/" />;
      });
    //socket connecting function
    const init = async (videoStream) => {
      // PeerJS functionality starts
      var peer_params = {
        host: server_host,
        port: 443,
        path: "/myapp",
      };
      if (server_host === "localhost") peer_params["port"] = 3007;
      peer = new Peer(peer_params);
      // once peer created join room
      peer.on("open", function (id) {
        myPeerId = id;

        addVideo(videoStream, id, myName);
        fetch(`${server}join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId,
            userName: myName,
            peerId: id,
          }),
        })
          .then((res) => res.json())
          .then((res_arr) => {
            const { data } = res_arr;
            setAllPeers(data);
            for (const { peerId, userName } of data) {
              let conn = peer.connect(peerId);

              conn.on("open", () => {
                myConns.set(conn, userName);
                conn.send({ sig: 1, data: { id, name: myName } });
                let call = peer.call(peerId, videoStream);
                call.on("stream", (remoteStream) => {
                  mycalls.add(call);
                  addVideo(remoteStream, peerId, userName);
                });
              });

              conn.on("data", ({ sig, data }) => {
                recvHandler(conn, sig, data);
              });

              conn.on("close", () => {
                myConns.delete(conn);
                const element = document.getElementById(peerId);
                element?.remove();
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      });

      peer.on("connection", (conn) => {
        conn.on("data", ({ sig, data }) => {
          recvHandler(conn, sig, data);
        });
        conn.on("close", () => {
          myConns.delete(conn);
          toast.success(`${idName[conn.peer]} left the Call`);
          const element = document.getElementById(conn.peer);
          element?.remove();
        });
      });

      peer.on("call", (call) => {
        call.answer(videoStream);
        mycalls.add(call);
        call.on("stream", (remoteStream) => {
          addVideo(remoteStream, call.peer, idName[call.peer]);
        });
        toast.success(`${idName[call.peer]} joined the Call`);
      });
    };

    // Clean up function to remove camera permissions and end socket
    return () => {
      const ele = document.getElementById(myPeerId);
      ele?.remove();
      clearInterval(timer);
      if (peer) {
        try {
          fetch(`${server}leave`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              roomId,
              peerId: myPeerId,
            }),
          });
        } catch (err) {
          console.log(err);
          toast.error("Coudn't leave the room at the current moment");
        }
        peer.destroy();
      }
      if (dataStream) {
        const tracks = dataStream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [videoOn, audioOn]);

  const sendHandler = (sig, data) => {
    for (const [conn] of myConns) {
      conn.send({ sig, data });
    }
  };

  const recvHandler = (conn, sig, data) => {
    switch (sig) {
      case 1: {
        //share name
        const { id, name } = data;
        myConns.set(conn, name);
        idName[id] = name;
        conn.send(3, { value: code });
        break;
      }
      case 2: {
        // chat msg
        const { userName, msg } = data;
        addRecvMsg(msg, userName);
        break;
      }
      case 3: {
        // code update
        const { value } = data;
        console.log(value);
        if (value !== code) setcode(value);
        break;
      }
      case 4: {
        // language change
        const { newLang } = data;
        if (lang !== newLang) setLang(newLang);
        break;
      }
      default:
        break;
    }
  };

  const addRecvMsg = (text, name = "Unknown") => {
    setChatState(true);
    const element = ` <div class='receive'>
                    <div class='msg'>
                    <span class='senderName' >${name}</span>
                       ${text}
                    </div>
                </div>`;
    const rdiv = document.createElement("div");
    rdiv.innerHTML = element;
    rdiv.setAttribute("class", "msg-container");
    const par = document.getElementById("msg-div");
    par?.appendChild(rdiv);
    if (par) par.scrollTop = par.scrollHeight;
  };

  //Functions related to this component
  function addVideo(vstream, peerID, userName = "user") {
    const prev = document.getElementById(peerID);
    prev?.remove();
    const row = document.createElement("div");
    row.setAttribute("class", "mt-2");
    row.setAttribute("id", peerID);

    const video = document.createElement("video");
    video.srcObject = vstream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    // console.log(peerID, myPeerId);
    if (peerID === myPeerId) {
      video.muted = true;
      myVideo.current = video;
    }

    const span = document.createElement("span");
    span.innerText = userName;
    span.setAttribute("class", "tagName");

    row.append(video);
    row.append(span);

    const exist = document.getElementById(peerID);
    if (exist) return;

    const peerDiv = document.getElementById("peerDiv");

    peerDiv?.insertBefore(row, peerDiv.children[0]);
  }

  const screenShareHandler = async (e) => {
    e.preventDefault();
    setDisplayCheck(!displayCheck);
    idName["screen"] = "screen";
    navigator?.mediaDevices
      ?.getDisplayMedia({ audio: true })
      .then((displStream) => {
        screenStream = displStream;
        addVideo(displStream, "screen", "Screen");
        replaceStream(displStream);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const replaceStream = (mediaStream) => {
    for (const call of mycalls) {
      for (let sender of call.peerConnection?.getSenders()) {
        if (sender.track.kind === "audio") {
          if (mediaStream.getAudioTracks().length > 0) {
            sender.replaceTrack(mediaStream.getAudioTracks()[0]);
          }
        }
        if (sender.track.kind === "video") {
          if (mediaStream.getVideoTracks().length > 0) {
            sender.replaceTrack(mediaStream.getVideoTracks()[0]);
          }
        }
      }
    }
  };

  function stopCapture(evt) {
    evt.preventDefault();
    setDisplayCheck(!displayCheck);
    replaceStream(stream);
    let ele = document.getElementById("screen");
    const evid = ele?.childNodes[1];
    if (evid && evid.srcObject) {
      const tracks = evid.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    ele?.remove();
  }

  function leaveRoom() {
    if (peer) {
      try {
        fetch(`${server}leave`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId,
            peerId: myPeerId,
          }),
        });
      } catch (err) {
        console.log(err);
        toast.error("Coudn't leave the room at the current moment");
      }
      peer.destroy();
    }
    if (dataStream) {
      const tracks = dataStream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    clearInterval(timer);
    history("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const handleChat = () => {
    setIsSidebarOpen(true);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleInfo = () => {
    setinfoSideOpen(true);
  };

  const closeInfo = () => {
    setinfoSideOpen(false);
  };

  return (
    <>
      <div className=" min-h-screen" style={{ backgroundColor: "#212529" }}>
        <div className="max-w-8xl p-3">
          <div className="flex items-start justify-center gap-3">
            <div className="">
              <Editor
                conns={myConns}
                roomId={roomId}
                onCodeChange={setcode}
                code={code}
                lang={lang}
                peer={peer}
                sendHandler={sendHandler}
              />
            </div>
            {videoOn ? (
              <div>
                <DrawingPad />
                <div style={{ flexShrink: 0 }}>
                  <div className="">
                    <h2 className=" text-white font-semibold text-2xl m-1">
                      Participant Videos
                    </h2>
                  </div>
                  <div
                    className=" rounded-md flex w-[200px] h-[150px] gap-4 text-white"
                    id="peerDiv"
                  ></div>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <DrawingPad />
                <div className="">
                  <h2 className=" text-white font-semibold text-2xl m-3">
                    Participant Videos
                  </h2>
                </div>
                <div className="bg-black rounded-md relative w-[200px] h-[150px] text-white">
                  <div className=" absolute top-12  left-20 ml-2 text-2xl">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="lucide lucide-video-off"
                    >
                      <path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196" />
                      <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" />
                      <path d="m2 2 20 20" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          className="flex items-center justify-around absolute bottom-0 w-full p-4 h-14 gap-5 "
          style={{ backgroundColor: "#282a34" }}
        >
          <div className=" flex gap-4">
            <h2 className="text-white font-semibold border-b">{myName}</h2>
            <h2 className="text-white font-semibold border-l pl-3">{roomId}</h2>
          </div>
          <div className="flex justify-center items-center gap-7">
            <button onClick={toggleVideo} className="text-white">
              {videoOn ? (
                <div className=" rounded-full p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-video-off"
                  >
                    <path d="M10.66 6H14a2 2 0 0 1 2 2v2.5l5.248-3.062A.5.5 0 0 1 22 7.87v8.196" />
                    <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" />
                    <path d="m2 2 20 20" />
                  </svg>
                </div>
              ) : (
                <div className=" hover:bg-gray-600 rounded-full p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-video"
                  >
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect
                      x="1"
                      y="5"
                      width="15"
                      height="14"
                      rx="2"
                      ry="2"
                    ></rect>
                  </svg>
                </div>
              )}
            </button>
            <button className="text-white" onClick={toggleAudio}>
              {audioOn ? (
                <div className=" rounded-full p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-mic-off"
                  >
                    <line x1="2" x2="22" y1="2" y2="22" />
                    <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
                    <path d="M5 10v2a7 7 0 0 0 12 5" />
                    <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                </div>
              ) : (
                <div className="hover:bg-gray-600 rounded-full p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-mic"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                </div>
              )}
            </button>
            <button
              className=""
              onClick={!displayCheck ? screenShareHandler : stopCapture}
            >
              <div className=" p-2 hover:bg-gray-600 rounded-full text-white ">
                {!displayCheck ? (
                  <MdOutlineScreenShare size={30} />
                ) : (
                  <MdOutlineStopScreenShare size={30} />
                )}
              </div>
            </button>
            <button className="">
              <div className=" text-white hover:bg-gray-500 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-ellipsis-vertical"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </div>
            </button>
            <button className="text-white" onClick={leaveRoom}>
              <div className=" bg-red-500 rounded-full p-2">
                <MdCallEnd size={24} />
              </div>
            </button>
          </div>
          <div className=" flex gap-4">
            <button className="" onClick={handleInfo}>
              <div className="text-white p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-info"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>
            </button>
            <button className="">
              <div className="text-white p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-users"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </button>
            <button className="" onClick={handleChat}>
              <div className="text-white rounded-full p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-message-square-more"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M8 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M16 10h.01" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
      <Chat
        recvMsg={addRecvMsg}
        conns={myConns}
        roomId={roomId}
        userName={myName}
        sendHandler={sendHandler}
        peer={peer}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      <Info roomId={roomId} isOpen={infoSideOpen} onClose={closeInfo} />
    </>
  );
};

export default PeerCall;
