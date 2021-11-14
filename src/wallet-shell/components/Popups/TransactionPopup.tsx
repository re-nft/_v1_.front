import React, { ReactNode } from "react";
import { AlertCircle, CheckCircle } from "react-feather";
import { useActiveWeb3React } from "../../state-hooks";
import { ExternalLink } from "../common/ExternalLink";
import { getEtherscanLink } from "../../utils";

const RowNoFlex = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-row items-center justify-start w-full">
      {children}
    </div>
  );
};

const AutoColumn = ({ children }: { children: ReactNode }) => {
  return <div className="grid auto-rows-auto gap-y-2 ">{children}</div>;
};
export function TransactionPopup({
  hash,
  success,
  summary,
}: {
  hash: string;
  success?: boolean;
  summary?: string;
}) {
  const { chainId } = useActiveWeb3React();

  return (
    <RowNoFlex>
      <div style={{ paddingRight: 16 }}>
        {success ? (
          <CheckCircle color="#10B981" size={24} />
        ) : (
          <AlertCircle color="#EF4444" size={24} />
        )}
      </div>
      <AutoColumn>
        <p className="font-medium overflow-ellipsis">
          {summary ?? "Hash: " + hash.slice(0, 8) + "..." + hash.slice(58, 65)}
        </p>
        {chainId && (
          <ExternalLink href={getEtherscanLink(chainId, hash, "transaction")}>
            View on Etherscan
          </ExternalLink>
        )}
      </AutoColumn>
    </RowNoFlex>
  );
}
