import { RefObject, MutableRefObject, SetStateAction, Dispatch } from "react";
import { Channel } from "phoenix";
import { DescriptionInitType, UserType } from "../types/rtcTypes";
import { CandDataType } from "../types/rtcTypes";
import { rtcConfig } from "../constants/constants";

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
  me: UserType,
  remoteId: string
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
    sendSDP(
      { userId: me.id, description: offer, destinationId: remoteId },
      channel
    );
  }
};

export const setOffer = async (
  connection: RTCPeerConnection,
  offer: RTCSessionDescriptionInit
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
  me: UserType,
  remoteId: string
) => {
  const answer = await connection.createAnswer().catch();
  await connection.setLocalDescription(answer).catch((error) => {
    console.log(error);
  });
  console.log("[createAnswer] set answer to local");
  sendSDP(
    { userId: me.id, description: answer, destinationId: remoteId },
    channel
  );
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

/** setup icecandidate and media stream (you should do this at first) */
export const setUpPeerConnection = (
  connection: RTCPeerConnection,
  channel: Channel,
  me: UserType,
  localStreamRef: MutableRefObject<MediaStream | undefined>,
  setRemoteVideoStream: Dispatch<
    SetStateAction<
      {
        stream: MediaStream;
        id: string;
      }[]
    >
  >,
  destinationId: string
) => {
  console.log("[setUpPeerConnection] start");

  /** trickle ice */
  connection.onicecandidate = (event) => {
    if (event.candidate) {
      const candData: CandDataType = {
        userId: me.id,
        candidate: event.candidate,
        destinationId: destinationId,
      };
      channel.push("ice", candData);
      console.log("[ON ICE] send ice candidate");
    } else {
      console.log("ice candidate data is ready");
    }
  };

  // settings for remote stream
  connection.ontrack = (event: RTCTrackEvent) => {
    console.log("recieved remote stream");
    console.log(event.streams);
    setRemoteVideoStream((before) => [
      ...before,
      { stream: event.streams[0], id: destinationId },
    ]);
  };

  // add WebCam stream to peer connection
  console.log("add track to connection");
  localStreamRef.current?.getTracks().forEach((track) => {
    if (localStreamRef.current)
      connection.addTrack(track, localStreamRef.current);
  });

  channel.on("description", (descriptionData: DescriptionInitType) => {
    console.log(descriptionData);
    const description = descriptionData.description;
    if (descriptionData.userId === me.id) {
      console.log("[ON RECIEVE SDP]got data from me");
      console.log(me.id);
      console.log(description.type);
    } else {
      if (description.type === "offer") {
        setOffer(connection, description).then(() =>
          createAnswer(connection, channel, me, descriptionData.userId)
        );
      } else if (description.type === "answer") {
        setAnswer(connection, description);
      } else {
        console.error("[ON RECIEVE SDP] error type");
        console.error(description);
      }
    }
  });

  channel.on("ice", (data: CandDataType) => {
    if (data.userId !== me.id) {
      console.log("[ICE] recieved remote candidate data");
      connection
        .addIceCandidate(data.candidate)
        .then(() => console.log("[ICE] successfully added"))
        .catch((error) => {
          console.error("[ICE] add ice candidate error");
          console.error(error);
        });
    }
  });
};

export const createPeerFromOffer = (
  offer: RTCSessionDescriptionInit,
) => {
  const peerConnection = new RTCPeerConnection(rtcConfig);
  setOffer(peerConnection, offer);

  return peerConnection;
};
