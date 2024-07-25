import { useState } from "react";
import "../assets/styles/styles.css";
import { MdClose } from "react-icons/md";

const Chat = ({ sendHandler, userName, isOpen, onClose }) => {
  const [msg, setmsg] = useState("");

  const handleChange = (e) => {
    setmsg(e.target.value);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (msg.length == 0) return;
    sendHandler(2, { userName, msg });
    addSendMsg(msg);
    setmsg("");
  };

  const addSendMsg = (text) => {
    const ele = `<div class='send'> 
            <div class='msg'>
               ${text}
            </div>
        </div>`;
    const div = document.createElement("div");
    div.innerHTML = ele;
    div.setAttribute("class", "msg-container");

    const par = document.getElementById("msg-div")?.appendChild(div);
    par.scrollTop = par.scrollHeight;
  };
  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2 className=" font-semibold text-xl text-gray-100">Chat messages</h2>
        <button className=" text-gray-100 close-btn" onClick={onClose}>
          <MdClose size={24} />
        </button>
      </div>
      <div className="">
        <div className="" id="msg-div"></div>
        <div className=" absolute bottom-0 p-2 w-full">
          <form onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Message.."
              name="msg"
              onChange={handleChange}
              value={msg}
              className=" w-full p-2 border  border-gray-300 focus:outline-none rounded-lg bg-transparent text-black"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
