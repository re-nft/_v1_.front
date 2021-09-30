import React from "react";

export const InstallMetamask: React.FC = () => {
  return (
    <div id="installMetaMask" >
      <a
        href="https://metamask.io/"
        target="_blank"
        rel="noreferrer"
        className="flex justify-center items-center flex-col -mt-8 font-display text-xs uppercase"
      >
        <div className="flex-1">
          <img src="/metamask.svg" alt="MetaMask" className='h-8 w-8'/>
        </div>
        <div className="flex-1">
          Install MetaMask
        </div>
      </a>
    </div>
  );
};
