import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import copy from "copy-to-clipboard";
import { nanoid } from "nanoid";
import Features from "../components/features";
import Navbar from "../components/navbar";
import code from "../assets/images/demo.cpp.png";
import Footer from "../components/footer";

const Home = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [sid, setsId] = useState("");
  const [sid1, setsId1] = useState("");

  const genCode = (e) => {
    e.preventDefault();

    let id = nanoid(10);
    setsId(id);
    setsId1(id);
    if (copy(id)) {
      toast.success("created new room");
    } else {
      toast.error("Cannot copy to clipboard");
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (sid.length === 0 && sid1.length === 0) {
      toast("Please generate or fill the Session ID", {
        icon: "❕",
      });
      return;
    }
    if (userName.length == 0) {
      toast.error("Name field is empty");
      return;
    }
    const roomId = sid.length > 0 ? sid : sid1;
    if (sid.length > 0) {
      localStorage.setItem("init", "true");
    }
    toast.success("Joining new Call");
    navigate(`/editor/${roomId}`, {
      state: {
        userName: userName,
      },
    });
  };

  return (
    <>
      <Navbar />
      <div className="fade-in bg-gray-800 min-h-screen py-12">
        <div className="max-w-8xl w-full flex flex-col lg:flex-row items-center justify-center gap-4">
          <div className="max-w-3xl text-center lg:text-left">
            <h2 className="text-4xl text-shadow-lg   lg:text-6xl font-medium lg:leading-relaxed text-gray-100">
              <span className=" text-4xl lg:text-6xl">&quot;</span>
              Real Time Collaborative Coding for your Growth in Coding.
            </h2>
            <p className="leading-relaxed text-lg lg:text-xl text-gray-500 mt-4">
              "Enhance your coding skills with Real-Time Collaborative Coding
              for continuous growth and development."
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-5 mt-8 w-full lg:w-auto p-4">
            <div className="flex flex-col gap-4 items-center justify-center w-full lg:w-auto">
              <input
                className="w-full lg:w-96 border text-white border-white bg-transparent p-3 rounded-md"
                placeholder="Enter Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <input
                className="w-full lg:w-96 border text-white border-white p-3 bg-transparent rounded-md"
                placeholder="Enter Room Id"
                value={sid}
                onChange={(e) => setsId(e.target.value)}
              />
              <button
                onClick={handleJoin}
                className="bg-green-500 w-full lg:w-96 p-3 hover:scale-105 rounded-md font-medium text-white"
              >
                Join Room
              </button>
              <div className="text-white text-center">
                Don't have a room Id create one here{" "}
                <button onClick={genCode} className="underline">
                  new room
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl w-full py-12">
          <div className="w-full lg:w-1/2 h-auto mx-auto shadow-2xl">
            <img
              src={code}
              alt="Collaborative Coding"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <Features />
        <Footer />
      </div>
    </>
  );
};

export default Home;
