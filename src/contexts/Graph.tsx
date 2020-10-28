import { createContext } from "react";

const DefaultGraphContext = {
  nfts: [],
  faces: []
};

const GraphContext = createContext(DefaultGraphContext);

export default GraphContext;
