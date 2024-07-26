const express = require("express");
const { ExpressPeerServer } = require("peer");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3007;

let peers = [];

// Endpoint to join a room
app.post("/join", (req, res) => {
  const { roomId, userName, peerId } = req.body;
  const existingPeer = peers.find((peer) => peer.peerId === peerId);
  if (!existingPeer) {
    peers.push({ roomId, userName, peerId });
  }
  const roomPeers = peers.filter((peer) => peer.roomId === roomId);
  res.json({ data: roomPeers });
});

// Endpoint to leave a room
app.post("/leave", (req, res) => {
  const { roomId, peerId } = req.body;
  peers = peers.filter((peer) => peer.peerId !== peerId);
  const roomPeers = peers.filter((peer) => peer.roomId === roomId);
  res.json({ data: roomPeers });
});

// Create an HTTP server and integrate PeerJS
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Create a PeerJS server
const peerServer = ExpressPeerServer(server, {
  path: "/",
});

app.use("/myapp", peerServer);
