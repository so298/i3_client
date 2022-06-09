import { rtcConfig } from "../constants/constants";

export const createPeerConection = async (
  description: RTCSessionDescription
) => {
  const peerConnection = new RTCPeerConnection(rtcConfig);
  await peerConnection.setLocalDescription(description).catch((error) => {
    console.error("create connection error");
    console.error(error);
  });
  console.log("new connection arrived");
  peerConnection.onicecandidate = (event) => {
    if (!event.candidate) {
      console.log('ice info collected');
      
    }
  }
  
  return peerConnection;
};

export const sendOffer = async (peerConnection: RTCPeerConnection) => {
  const offer = await peerConnection.createOffer().catch((error) => {
    console.error("sendOffer error");
    console.error(error);
  });
  if (offer) {
    peerConnection.setLocalDescription(offer).catch((error) => {
      console.error("set offer error");
    });
  }
  return offer;
};

export const recieveOffer = async (
  peerConnection: RTCPeerConnection,
  offer: RTCSessionDescriptionInit
) => {
  await peerConnection.setRemoteDescription(offer).catch((error) => {
    console.error("recive offer error");
    console.error(error);
  });
};

export const sendAnswer = (peerConnection: RTCPeerConnection) => {};
