import { Channel } from "phoenix";
import { DescriptionInitType, UserType } from "../types/rtcTypes";

/** send local SDP */
export const sendSDP = (
  descriptionData: DescriptionInitType,
  channel: Channel
) => {
  if (channel) {
    channel.push("description", descriptionData);
    console.log(`[sendSDP] sended ${descriptionData.description.type}`);
  } else {
    console.error("channel does not exist.");
  }
};

export const createOffer = async (
  connection: RTCPeerConnection,
  channel: Channel,
  user: UserType
) => {
  const offer = await connection
    .createOffer({ offerToReceiveVideo: true })
    .catch((description) => {});

  if (offer) {
    await connection.setLocalDescription(offer).catch((error) => {
      console.error("[createOffer] create Offer Error");
      console.error(error);
    });
    console.log("[createOffer] set offer to local");
    sendSDP({ userId: user.id, description: offer }, channel);
  }
};

export const setOffer = async (
  connection: RTCPeerConnection,
  offer: RTCSessionDescriptionInit,
  user: UserType
) => {
  await connection.setRemoteDescription(offer).catch((error) => {
    console.error("[setOffer] setRemoteDescripion error");
    console.error(error);
    return;
  });
  console.log("[SET OFFER]");
};

export const createAnswer = async (
  connection: RTCPeerConnection,
  channel: Channel,
  user: UserType
) => {
  const answer = await connection.createAnswer().catch();
  await connection.setLocalDescription(answer).catch((error) => {
    console.log(error);
  });
  console.log("[createAnswer] set answer to local");
  sendSDP({ userId: user.id, description: answer }, channel);
};

export const setAnswer = async (
  connection: RTCPeerConnection,
  answer: RTCSessionDescriptionInit
) => {
  await connection.setRemoteDescription(answer).catch((error) => {
    console.error("[setAnswer] setRemoteDescripion error");
    console.error(error);
    return;
  });
  console.log("[SET ANSWER]");
};
