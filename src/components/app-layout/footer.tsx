import React from "react";

export const Footer = () => {
  return (
    <div className="content-wrapper footer-content">
      <div className="copy">2021 ReNFT</div>
      <div className="copy">
        App version: {process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA}
      </div>
      <div className="soc">
        <a
          href="https://discord.gg/ka2u9n5sWs"
          target="_blank"
          rel="noreferrer"
        >
          <span className="discord"></span>
        </a>
        <a
          href="https://twitter.com/renftlabs"
          target="_blank"
          rel="noreferrer"
        >
          <span className="twitter"></span>
        </a>
      </div>
    </div>
  );
};
