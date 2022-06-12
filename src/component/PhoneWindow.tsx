import { Channel } from "phoenix";
import { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import { rtcConfig } from "../constants/constants";
import { UserType } from "../types/rtcTypes";
import {
  createAnswer,
  createOffer,
  setOffer,
  setUpPeerConnection,
} from "../utils/rtcSetup";

type PropsType = {
  me: UserType;
  partner: UserType;
  channel: Channel;
  localStreamRef: MutableRefObject<MediaStream | undefined>;
  offer?: RTCSessionDescriptionInit;
};

export const PhoneWindow: FC<PropsType> = ({
  me,
  partner,
  channel,
  localStreamRef,
  offer,
}) => {
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream>();

  useEffect(() => {
    const newPeerConnection = new RTCPeerConnection(rtcConfig);
    setPeerConnection(newPeerConnection);
    setUpPeerConnection(
      newPeerConnection,
      channel,
      me,
      localStreamRef,
      partner.id
    );
    newPeerConnection.ontrack = (event) => {
      if (videoRef.current) videoRef.current.srcObject = event.streams[0];
    };
    if (offer) {
      setOffer(newPeerConnection, offer).then(() =>
        createAnswer(newPeerConnection, channel, me, partner.id)
      );
    } else {
      createOffer(newPeerConnection, channel, me, partner.id);
    }
  }, []);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline />
    </div>
  );
};
