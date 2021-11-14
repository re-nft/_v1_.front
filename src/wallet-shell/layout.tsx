import React from "react";
import { CurrentBlockNumber } from "./components/CurrentBlockNumber";
import { Popups } from "./components/Popups";
import { URLWarning } from "./components/URLWarning";
import { Web3Status } from "./components/Web3Status";
import { Web3StatusManager } from "./index.manager";
import { Web3StatusProvider } from "./index.provider";
import {
  AppWrapper,
  HeaderWrapper,
  BodyWrapper,
  Marginer,
  HeaderFrame,
  HeaderControls,
} from "./layout.styles";
import { Updaters } from "./updaters";

// Example layout
export const Layout: React.FC = ({ children }) => {
  return (
    <AppWrapper>
      <Web3StatusProvider>
        <URLWarning />
        <Updaters />
        <HeaderWrapper>
          <HeaderFrame>
            <HeaderControls>
              <Web3Status />
            </HeaderControls>
          </HeaderFrame>
        </HeaderWrapper>
        <BodyWrapper>
          <CurrentBlockNumber />
          <Popups />
          <Web3StatusManager>{children}</Web3StatusManager>
          <Marginer />
        </BodyWrapper>
      </Web3StatusProvider>
    </AppWrapper>
  );
};

export default Layout;
