import React from "react";
import { ExternalLink } from "../common/ExternalLink";
import {
  OptionCardClickable,
  OptionCardLeft,
  HeaderText,
  SubHeader,
  GreenCircle,
  IconWrapper,
} from "./Option.syles";
import { MetamaskIcon } from "../common/icons/metamask";
import { CoinbaseIcon } from "../common/icons/coinbase";
import { WalletConnectIcon } from "../common/icons/walletconect";
import { ArrowRight } from "react-feather";

interface Props {
  link?: string | null;
  clickable?: boolean;
  onClick?: () => void;
  color: string;
  header: React.ReactNode;
  subheader: React.ReactNode | null;
  icon: string;
  active?: boolean;
  id: string;
}
// TODO icon
export function Option({
  link = null,
  clickable = true,
  onClick,
  header,
  icon,
  active = false,
  id,
  subheader,
}: Props) {
  const content = (
    <OptionCardClickable
      id={id}
      onClick={onClick}
      clickable={clickable && !active}
      active={active}
    >
      <OptionCardLeft>
        <HeaderText>
          {active && <GreenCircle />}
          {header}
        </HeaderText>
        {subheader && <SubHeader>{subheader}</SubHeader>}
      </OptionCardLeft>
      <IconWrapper>
        {icon === "metamask" && <MetamaskIcon />}
        {icon === "arrow-right" && <ArrowRight size="24px" />}
        {icon === "coinbase" && <CoinbaseIcon />}
        {icon === "wallet-connect" && <WalletConnectIcon />}
      </IconWrapper>
    </OptionCardClickable>
  );
  if (link) {
    return <ExternalLink href={link}>{content}</ExternalLink>;
  }

  return content;
}
