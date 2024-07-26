import { MdClose, MdCopyAll } from "react-icons/md";
import "../assets/styles/styles.css";
import toast from "react-hot-toast";

const Info = ({ isOpen, onClose, roomId }) => {
  const copyToClipboard = () => {
    const link = `${roomId}`;
    navigator.clipboard.writeText(link).then(
      () => {
        toast.success("copied to clipboard");
      },
      () => {
        toast.error("Error in copying");
      }
    );
  };

  return (
    <div className={`info ${isOpen ? "open" : ""}`}>
      <div className="info-header">
        <h2 className=" font-semibold text-xl text-gray-100">Call Details</h2>
        <button className=" text-gray-100 close-btn" onClick={onClose}>
          <MdClose size={24} />
        </button>
      </div>
      <div className="p-7">
        <h2 className=" text-xl ">Joining Info</h2>
        <p className=" text-gray-400 mb-2">
          https://collabcode-kohl.vercel.app/{roomId}
        </p>
        <button
          className=" bg-transparent border border-white hover:scale-105 rounded-md px-2 py-2 font-semibold  flex gap-3 "
          onClick={copyToClipboard}
        >
          <MdCopyAll size={24} /> Copy Joining Info
        </button>
      </div>
    </div>
  );
};

export default Info;
