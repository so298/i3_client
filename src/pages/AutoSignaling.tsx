import { channel } from "diagnostics_channel";
import { Channel, Socket } from "phoenix";
import { useEffect, useState, useRef } from "react";

import { rtcConfig } from "../constants/constants";
import { CandDataType, DescriptionInitType, UserType } from "../types/rtcTypes";
import {
  createOffer,
  setOffer,
  createAnswer,
  setAnswer,
} from "../utils/rtcSetupSingle";

const AutoSignaling = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [user, setUser] = useState<UserType | null>(null);

  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream>();

  const sdpRemoteTextRef = useRef<HTMLTextAreaElement>(null);
  const sdpLocalTextRef = useRef<HTMLTextAreaElement>(null);

  const url = process.env.REACT_APP_DEV_SOCKET_ADDRESS as string;

  useEffect(() => {
    addVideoStream();

    const newSocket = new Socket(url);
    newSocket.connect();
    const newChannel = newSocket.channel("room:lobby", {
      name: "hoge",
      id: "hogehoge",
    });

    newChannel
      .join()
      .receive("ok", (res: { me: UserType }) => {
        console.log("[WEBSOCKET] create channel");
        console.log(res);
        setUser(res.me);
        const newPeerConnection = new RTCPeerConnection(rtcConfig);
        setPeerConnection(newPeerConnection);
        setUpPeerConnection(newPeerConnection, newChannel, res.me);
      })
      .receive("error", (res) => console.log(res));

    setSocket(newSocket);
    setChannel(newChannel);

    return () => {
      newChannel.leave();
      newSocket.disconnect();
    };
  }, []);

  const callAction = () => {
    if (user) {
      if (peerConnection) {
        if (channel) createOffer(peerConnection, channel, user);
        else console.error("[callAction] channel does not exist.");
      } else {
        console.error("[callAction] peerConnection does not exist.");
      }
    } else {
      console.error("[callAction] user data is not ready");
    }
  };

  /** setup icecandidate and media stream (you should do this at first) */
  const setUpPeerConnection = (
    connection: RTCPeerConnection,
    channel: Channel,
    me: UserType
  ) => {
    console.log("[setUpPeerConnection] start");

    /** trickle ice */
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        const candData: CandDataType = {
          userId: me.id,
          candidate: event.candidate,
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
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      } else console.error("remoteVideoRef is null");
    };

    // add WebCam stream to peer connection
    console.log("add track to connection");
    localStreamRef.current?.getTracks().forEach((track) => {
      if (localStreamRef.current)
        connection.addTrack(track, localStreamRef.current);
    });

    channel.on("description", (descriptionData: DescriptionInitType) => {
      const description = descriptionData.description;
      if (descriptionData.userId === me.id) {
        console.log("[ON RECIEVE SDP]got data from me");
        console.log(me.id);
        console.log(description.type);
      } else {
        if (description.type === "offer") {
          setOffer(connection, description, me).then(() =>
            createAnswer(connection, channel, me)
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

  /** set WebCam video stream */
  const addVideoStream = async () => {
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      video: true,A
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  };

  return (
    <div className="App">
      <div>
        <p>id:{user?.id.slice(10)}</p>
      </div>
      <video style={{ width: 400 }} ref={localVideoRef} autoPlay playsInline />
      <video style={{ width: 400 }} ref={remoteVideoRef} autoPlay playsInline />
      <br />
      <div>
        <button
          onClick={() => {
            channel?.push("room", {}).receive("ok", (res) => console.log(res));
          }}
        >
          get users
        </button>
        <button onClick={callAction}>Call</button>
        <button onClick={() => console.log(channel)}>show info</button>
      </div>
      <div>
        local sdp
        <textarea ref={sdpLocalTextRef} rows={5} cols={60}></textarea>
      </div>
      <div>
        remote sdp
        <textarea ref={sdpRemoteTextRef} rows={5} cols={60}></textarea>
      </div>
    </div>
  );
};

export default AutoSignaling;
