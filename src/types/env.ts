type EnvironmentType = {
  socketUrl: string;
};

const environment: EnvironmentType = {
  socketUrl: "", // || process.env.REACT_APP_SOCKET_ADDRESS || ''
};

export default environment;
