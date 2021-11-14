import React from "react";
import Loader from "./loader";

const CatalogueLoader: React.FC = () => (
  <div
    className="text-center text-lg text-white font-display leading-tight"
    aria-label="catalogue-loader"
  >
    <Loader />
  </div>
);

export default CatalogueLoader;
