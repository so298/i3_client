import { FC, useEffect, useRef } from "react";

export const Video: FC<{ stream: MediaStream; id: string }> = ({
  stream,
  id,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const addStream = () => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  useEffect(() => {
    addStream();
  }, []);
  return (
    <div>
      <video style={{ width: 400 }} ref={videoRef} autoPlay playsInline />
      <br />
      id = {id}
      <button onClick={addStream}>add stream</button>
    </div>
  );
};
