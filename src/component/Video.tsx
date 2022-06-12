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
      <video style={{ width: 400 }} ref={videoRef} autoPlay playsInline />
      <br />
      id = {id}
    </div>
  );
};
