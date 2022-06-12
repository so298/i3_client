import { Channel, Socket } from "phoenix";
import { useEffect, useState, useRef } from "react";
import { PhoneWindow } from "../component/PhoneWindow";
import { Video } from "../component/Video";

import { socketUrl } from "../constants/constants";
import {
  DescriptionInitType,
  JoinResponseType,
  RoomType,
  UserType,
} from "../types/rtcTypes";
import { createPeerConnection } from "../utils/rtcSetup";

const Main = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [me, setMe] = useState<UserType | null>(null);
  const [room, setRoom] = useState<RoomType | null>(null);
  const [partners, setPartners] = useState<
    { id: string; name: string; connection: RTCPeerConnection }[]
  >([]);
  const [remoteVideoStreams, setRemoteVideoStreams] = useState<
    { stream: MediaStream; id: string }[]
  >([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
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
      .receive("ok", (joinRes: JoinResponseType) => {
        console.log("[WEBSOCKET] create channel");
        console.log(joinRes);
        setMe(joinRes.me);
        setRoom(joinRes.room);

        joinRes.room.users.forEach((partner) => {
          if (partner.id === joinRes.me.id) {
            const newConnection = createPeerConnection(
              joinRes.me,
              partner,
              newChannel,
              localStreamRef
            );
            newConnection.ontrack = (event) => {
              setRemoteVideoStreams((prev) => [
                ...prev,
                { stream: event.streams[0], id: partner.id },
              ]);
            };
            const appendData = {
              id: partner.id,
              name: partner.name,
              connection: newConnection,
            };
            setPartners((before) => [...before, appendData]);
          }
        });

        newChannel.on("description", (res: DescriptionInitType) => {
          if (res.userId === joinRes.me.id) {
            console.log("recieved offer from me");
          } else {
            /** when recive offer from unknown */
            if (res.description.type === "offer") {
              setPartners((before) => {
                if (before.filter(({ id }) => id === res.userId).length === 0) {
                  const partner: UserType = { id: res.userId, name: "" };
                  const newConnection = createPeerConnection(
                    joinRes.me,
                    partner,
                    newChannel,
                    localStreamRef,
                    res.description
                  );
                  newConnection.ontrack = (event) => {
                    setRemoteVideoStreams((prev) => [
                      ...prev,
                      { stream: event.streams[0], id: res.userId },
                    ]);
                  };
                  return [
                    ...before,
                    { id: res.userId, name: "hoge", connection: newConnection },
                  ];
                } else return before;
              });
            }
          }
        });
      })
      .receive("error", (res) => console.error(res));

    setSocket(newSocket);
    setChannel(newChannel);

    return () => {
      newChannel.leave();
      newSocket.disconnect();
    };
  }, []);

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
      </div>
      <div>
        It's me!!
        <br />
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
        {remoteVideoStreams.map((elem, idx) => (
          <Video key={idx} {...elem} />
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
