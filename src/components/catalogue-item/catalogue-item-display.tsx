import React from "react";
// @ts-ignore
import { Player } from "video-react";
import { isVideo } from "../../utils";

export const CatalogueItemDisplay: React.FC<{
  image?: string;
  description?: string;
}> = ({ image, description }) => {
  if (!image)
    return (
      <div className="overflow-hidden aspect-w-1 aspect-h-1 overflow-hidden lg:h-50">
        <div className="flex items-center justify-center bg-purple-300 tracking-wide">
          NO IMG
        </div>
      </div>
    );
  if (isVideo(image))
    return (
      <div className="overflow-hidden aspect-h-1 overflow-hidden lg:h-50">
        <Player playsInline autoPlay src={image} muted />
      </div>
    );
  return (
    <div className="overflow-hidden aspect-w-1 aspect-h-1 overflow-hidden lg:h-50">
      <img
        alt={description}
        src={image}
        className="w-full h-full object-center object-cover lg:w-full lg:h-full"
      />
    </div>
  );
};
