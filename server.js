const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

let peers = [];

app.post("/join", (req, res) => {
  const { roomId, userName, peerId } = req.body;
  const existingPeer = peers.find((peer) => peer.peerId === peerId);
  if (!existingPeer) {
    peers.push({ roomId, userName, peerId });
  }
  const roomPeers = peers.filter((peer) => peer.roomId === roomId);
  res.json({ data: roomPeers });
});

app.post("/leave", (req, res) => {
  const { roomId, peerId } = req.body;
  peers = peers.filter((peer) => peer.peerId !== peerId);
  const roomPeers = peers.filter((peer) => peer.roomId === roomId);
  res.json({ data: roomPeers });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
