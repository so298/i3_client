export const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const socketUrl: string =
  (process.env.REACT_APP_DEV_SOCKET_ADDRESS as string) || "";
