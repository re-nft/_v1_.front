import { useCallback, useState, useContext } from "react";
import { Contract } from "web3-eth-contract";

import DappContext from "../contexts/Dapp";
import { abis, addresses } from "../contracts";

const useFakeDai = () => {
  const [contract, setContract] = useState<Contract>();
  const { web3, wallet } = useContext(DappContext);

  const requestDai = useCallback(async () => {
    if (!web3 || !wallet?.account) return;
    let resolvedContract = contract;
    if (!resolvedContract) {
      resolvedContract = new web3.eth.Contract(
        abis.goerli.faucet.abi,
        addresses.goerli.faucet
      );
      setContract(resolvedContract);
    }

    await resolvedContract.methods
      .requestToken(addresses.goerli.dai)
      .send({ from: wallet.account });
  }, [web3, wallet, contract]);

  return requestDai;
};

export default useFakeDai;
