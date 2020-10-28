import React, { createContext, useEffect, useState, useCallback } from "react";
import { getGanFace } from "../api/ganFace";

type GanFacesContextType = {
  numFacesGenerated: number;
  face?: Blob;
  ipfsUri?: string;
  getFace: CallableFunction;
  stages: GanFaceStages;
};

enum GanFaceStages {
  Idle,
  Generating,
  ReadyForMinting,
  PinningToIpfs,
  Minting
}

const DefaultGanFacesContext: GanFacesContextType = {
  numFacesGenerated: 0,
  stages: GanFaceStages.Idle,
  getFace: () => {
    throw new Error("this must be implemented");
  }
};

const GanFacesContext = createContext<GanFacesContextType>(
  DefaultGanFacesContext
);

export const GanFacesProvider: React.FC = ({ children }) => {
  const [ganStages, setGanStages] = useState<GanFaceStages>(GanFaceStages.Idle);
  const [numFacesGenerated, setNumFaces] = useState<number>(0);
  const [face, setFace] = useState<Blob>();
  const [ipfsUri, setIpfsUri] = useState<string>();

  const getFace = useCallback(async () => {
    try {
      setGanStages(GanFaceStages.Generating);

      const ganFace = await getGanFace();
      const url = URL.createObjectURL(ganFace);
      const img = document.getElementById("face");
      img.setAttribute("src", url);

      setFace(face);
      setGanStages(GanFaceStages.ReadyForMinting);
    } catch (err) {
      console.debug("could not generate the face");
      setGanStages(GanFaceStages.Idle);
    }
  }, []);

  const mintFace = useCallback(async () => {
    setGanStages(GanFaceStages.PinningToIpfs);
  }, []);

  return (
    <GanFacesContext.Provider
      value={{
        numFacesGenerated,
        face,
        stages: ganStages,
        ipfsUri,
        getFace
      }}
    >
      {children}
    </GanFacesContext.Provider>
  );
};

export default GanFacesContext;
