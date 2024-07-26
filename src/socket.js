import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    "force new connections": true,
    reconnectionAttempt: "infinity",
    timeout: 10000,
    transports: ["websocket"],
  };

  return io("https://collabcode-pcx8.onrender.com", options);
};
