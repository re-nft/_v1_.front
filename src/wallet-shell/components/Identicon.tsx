import React from "react";
import { useActiveWeb3React } from "../state-hooks";
import { Jazzicon } from "@ukstv/jazzicon-react";

export function Identicon() {
  const { account } = useActiveWeb3React();

  const seed = account ? parseInt(account.slice(2, 10), 16).toString() : "";
  return <Jazzicon address={seed} className="identicon" />;
}
