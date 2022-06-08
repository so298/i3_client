import { Socket, Channel } from "phoenix";
import { useEffect, useState } from "react";
import environment from "../types/env";

export const useConnection = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  useEffect(() => {
    if (socket == null) {
      const newSocket = new Socket(environment.socketUrl, { params: {} });
      newSocket.connect();
      setSocket(newSocket);
      const newChannel = newSocket.channel("room:lobby");
      newChannel
        .join()
        .receive("ok", () => {
          console.log("channel connected");
        })
        .receive("error", () => {
          console.log("channel connection error");
        })
        .receive("timeout", () => {
          console.log("channel connection timeout");
        });
      setChannel(newChannel);
      
    }
  }, []);
  return {
    socket,
    channel,
  };
};
