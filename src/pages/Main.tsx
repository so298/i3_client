import { Channel, Socket } from "phoenix";
import { useEffect, useState, useRef, RefObject } from "react";
import { Video } from "../component/Video";

import { rtcConfig, socketUrl } from "../constants/constants";
import {
  DescriptionInitType,
  JoinResponseType,
  RoomType,
  UserType,
} from "../types/rtcTypes";
import {
  createOffer,
  setOffer,
  createAnswer,
  setAnswer,
  setUpPeerConnection,
  createPeerFromOffer,
} from "../utils/rtcSetup";

const Main = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [me, setMe] = useState<UserType | null>(null);
  const [room, setRoom] = useState<RoomType | null>(null);
  const [connectedIDs, setConnectedIDs] = useState<string[]>([]);

  const [peerConnections, setPeerConnections] = useState<RTCPeerConnection[]>(
    []
  );

  const videoStreamRefs = useRef<HTMLVideoElement[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [remoteVideoStreams, setRemoteVideoStreams] = useState<
    { stream: MediaStream; id: string }[]
  >([]);
  const localStreamRef = useRef<MediaStream>();

  useEffect(() => {
    addVideoStream();

    const newSocket = new Socket(socketUrl);
    newSocket.connect();
    const newChannel = newSocket.channel("room:lobby", {
      name: "hoge",
      id: "hogehoge",
    });

    newChannel
      .join()
      .receive("ok", (res: JoinResponseType) => {
        console.log("[WEBSOCKET] create channel");
        console.log(res);
        setMe(res.me);
        setRoom(res.room);
        setUpChannel(newChannel, res.me);
      })
      .receive("error", (res) => console.log(res));

    setSocket(newSocket);
    setChannel(newChannel);

    return () => {
      newChannel.leave();
      newSocket.disconnect();
    };
  }, []);

  const setUpChannel = (channel: Channel, me: UserType) => {
    channel.on("description", (res: DescriptionInitType) => {
      const description = res.description;
      if (description.type === "offer") {
        if (!connectedIDs.includes(res.userId)) {
          setConnectedIDs((before) => [...before, res.userId]);
          const newPeerConnection = createPeerFromOffer(description);
          setUpPeerConnection(
            newPeerConnection,
            channel,
            me,
            localStreamRef,
            setRemoteVideoStreams,
            res.userId
          );
          setPeerConnections((before) => [...before, newPeerConnection]);
          createAnswer(newPeerConnection, channel, me, res.userId);
        } else {
          console.error(
            "[ON RECIEVE DESCRIPTION] recieved offer from connected peer"
          );
        }
      }
    });
  };

  const callAction = (destinationId: string) => {
    if (me) {
      if (channel) {
        const newPeerConnection = new RTCPeerConnection(rtcConfig);
        setPeerConnections((before) => [...before, newPeerConnection]);
        setUpPeerConnection(
          newPeerConnection,
          channel,
          me,
          localStreamRef,
          setRemoteVideoStreams,
          destinationId
        );
        createOffer(newPeerConnection, channel, me, destinationId);
      } else {
        console.log("[callAction] channel is not ready.");
        return;
      }
    } else {
      console.error("[callAction] user data is not ready");
    }
  };

  /** set WebCam video stream */
  const addVideoStream = async () => {
    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  };

  return (
    <div className="App">
      <div>
        <p>id:{me?.id.slice(0, 10)}</p>
      </div>
      <div>
        <p>users</p>
        <div>
          {room?.users.map(({ id }) => (
            <div key={id}>
              <p>{id.slice(0, 10)}</p>
              <button
                onClick={() => {
                  callAction(id);
                  console.log();
                }}
              >
                Call
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        It's me!!
        <video
          style={{ width: 400 }}
          ref={localVideoRef}
          autoPlay
          playsInline
        />
      </div>
      <div></div>
      <br />
      <div>
        {remoteVideoStreams.map(({ stream, id }) => (
          <Video key={id} stream={stream} id={id} />
        ))}
      </div>
      <br />
      <div>
        <button
          onClick={() => {
            channel?.push("room", {}).receive("ok", (res) => console.log(res));
          }}
        >
          get users
        </button>
        <button onClick={() => console.log(channel)}>show info</button>
      </div>
    </div>
  );
};

export default Main;
