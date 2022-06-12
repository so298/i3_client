import { RefObject } from "react";

export type CandDataType = {
  userId: string;
  candidate: RTCIceCandidate;
  destinationId: string;
};

export type UserType = {
  id: string;
  name: string;
};

export type RoomType = {
  id: string;
  users: UserType[];
};

export type DescriptionInitType = {
  userId: string;
  description: RTCSessionDescriptionInit;
  destinationId: string;
};

export type JoinResponseType = {
  me: UserType;
  room: RoomType;
};

export type PeerType = {
  connection: RTCPeerConnection;
  stream: MediaStream | undefined;
};
