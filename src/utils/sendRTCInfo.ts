import { Channel } from "phoenix";

export const sendRTCInfo = async (channel: Channel | null) => {
  const config: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };
  const connection = new RTCPeerConnection();
  console.log(connection);
  const sessionDescription = await connection.createOffer();
  connection.onicecandidate = (event: RTCPeerConnectionIceEvent): void => {
    console.log(event);
  };
  await connection.setLocalDescription(sessionDescription);
};
