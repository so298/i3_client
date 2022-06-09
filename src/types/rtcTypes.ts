export type CandDataType = {
  userId: string;
  candidate: RTCIceCandidate;
};

export type UserType = {
  id: string;
  name: string;
};

export type DescriptionInitType = {
  userId: string;
  description: RTCSessionDescriptionInit;
};
