type EnvironmentType = {
  socketUrl: string;
}

const environment: EnvironmentType = {
  socketUrl: 'ws://157.82.202.235:4000/socket' // || process.env.REACT_APP_SOCKET_ADDRESS || ''
}

export default environment;