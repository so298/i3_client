import { FC, useEffect, useRef } from "react";

export const Video: FC<{ stream: MediaStream; id: string }> = ({
  stream,
  id,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, []);
  return (
    <div>
      id = {id}
      <br />
      <video style={{ width: 400 }} ref={videoRef} autoPlay playsInline />
    </div>
  );
};
