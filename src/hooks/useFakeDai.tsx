import { useCallback, useState, useContext } from "react";
import { Contract } from "web3-eth-contract";

import DappContext from "../contexts/Dapp";

const useFakeDai = () => {
  const [contract, setContract] = useState<Contract>();
  const { web3, wallet, addresses, abis } = useContext(DappContext);

  const requestDai = useCallback(async () => {
    if (
      !web3 ||
      !wallet?.account ||
      !addresses?.faucet ||
      !abis?.faucet ||
      !addresses.token
    )
      return;
    let resolvedContract = contract;
    if (!resolvedContract) {
      resolvedContract = new web3.eth.Contract(abis.faucet, addresses.faucet);
      setContract(resolvedContract);
    }

    // * token address and abi only available for Goerli
    await resolvedContract.methods
      .requestToken(addresses.token)
      .send({ from: wallet.account });
  }, [
    web3,
    wallet,
    contract,
    abis?.faucet,
    addresses?.faucet,
    addresses?.token,
  ]);

  return requestDai;
};

export default useFakeDai;
