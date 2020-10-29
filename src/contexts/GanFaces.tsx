import React, { createContext, useState, useCallback, useContext } from "react";

import { pinToIpfs } from "../api/pinToIpfs";
import { getGanFace } from "../api/ganFace";
import ContractsContext from "./Contracts";
import DappContext from "./Dapp";

type GanFacesContextType = {
  numFacesGenerated: number;
  face?: Blob;
  ipfsUri?: string;
  getFace: (event: React.SyntheticEvent) => void;
  mintFace: (event: React.SyntheticEvent) => void;
  stages: GanFaceStages;
};

export enum GanFaceStages {
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
  },
  mintFace: () => {
    throw new Error("this must be implemented");
  }
};

const GanFacesContext = createContext<GanFacesContextType>(
  DefaultGanFacesContext
);

export const GanFacesProvider: React.FC = ({ children }) => {
  // contexts
  const { web3, wallet } = useContext(DappContext);
  const { face: faceContract } = useContext(ContractsContext);

  // state
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

      setFace(ganFace);
      setGanStages(GanFaceStages.ReadyForMinting);
      console.log("num faces is", numFacesGenerated + 1);
      setNumFaces(numFacesGenerated + 1);
    } catch (err) {
      console.debug("could not generate the face");
      setGanStages(GanFaceStages.Idle);
    }
  }, []);

  const mintFace = useCallback(async () => {
    try {
      setGanStages(GanFaceStages.PinningToIpfs);

      if (face == null) {
        console.debug("can't mint when there is no face");
        return;
      }

      if (
        web3 == null ||
        faceContract == null ||
        wallet == null ||
        !wallet.account
      ) {
        console.debug("awaiting web3 and faceContract and wallet.account");
        return;
      }

      const pin = await pinToIpfs({ blob: face });
      const pinData = await pin.json();
      const uri = `https://gateway.pinata.cloud/ipfs/${pinData.IpfsHash}`;
      setIpfsUri(uri);
      setGanStages(GanFaceStages.Minting);

      await faceContract.methods
        .awardGanFace(wallet.account, uri)
        .send({ from: wallet.account });

      setGanStages(GanFaceStages.Idle);
    } catch (err) {
      console.debug("could not mint the face");
      setGanStages(GanFaceStages.ReadyForMinting);
    }
  }, [face, web3, faceContract, wallet]);

  return (
    <GanFacesContext.Provider
      value={{
        numFacesGenerated,
        face,
        stages: ganStages,
        ipfsUri,
        getFace,
        mintFace
      }}
    >
      {children}
    </GanFacesContext.Provider>
  );
};

export default GanFacesContext;
