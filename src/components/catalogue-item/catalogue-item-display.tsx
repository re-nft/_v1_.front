import React from "react";
// @ts-ignore
import { Player } from "video-react";
import { isVideo } from "../../utils";

export const CatalogueItemDisplay: React.FC<{
  image?: string;
  description?: string;
}> = ({ image, description }) => {
  if (!image) return <div className="no-img">NO IMG</div>;
  if (isVideo(image)) return <Player playsInline autoPlay src={image} muted />;
  return (
    <img
      alt={description}
      src={image}
      className="w-full h-full object-center object-cover lg:w-full lg:h-full"
    />
  );
};
