import React from "react";
import Loader from "./common/loader";

const CatalogueLoader: React.FC = () => (
  <div className="text-center text-lg text-white font-display py-32 leading-tight">
    <Loader />
  </div>
);

export default CatalogueLoader;
