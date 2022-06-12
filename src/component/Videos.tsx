import { FC } from "react";
import { Video } from "./Video";

export const Videos: FC<{
  videoDatas: { stream: MediaStream; id: string }[];
}> = ({ videoDatas }) => {
  return (
    <div>
      {videoDatas.map((stream) => (
        <Video {...stream} />
      ))}
    </div>
  );
};
