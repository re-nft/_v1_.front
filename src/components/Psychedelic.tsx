import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";

import ScrollForMore from "../components/ScrollForMore";
import DappContext from "../contexts/Dapp";
import { ENDPOINT, nftsQuery, userQuery } from "../api/graph";
import { request } from "graphql-request";

export const Catalogue = ({data, btnActionLabel}) => {
  const resolved = useMemo(() => {
    if (btnActionLabel === "Lend") {
      return data.user.faces;
    }
  }, [data, btnActionLabel]);

  return (<div className="Catalogue">
  {resolved.map((face) => {
    return (
      <div className="Catalogue__item" key={face.id}>
        <div
          className="Product snipcart-add-item"
          data-item-id={face.id}
          data-item-image={face.uri}
          data-item-name="a"
          data-item-url={`/`}
        >
          <div className="Product__image">
            <img alt="nft" src={face.uri} />
            {/* <Img key={product.token_id} fluid /> */}
            {/* <Img sizes={product.image.sizes} /> */}
          </div>
          <div className="Product__details">
            <div className="Product__name">
              {/* {product.asset_contract.address} */}
              {btnActionLabel === "Rent" && <div className="Product__price">10 €</div>}
            </div>
            <span className="Product__buy">{btnActionLabel} now</span>
          </div>
        </div>
      </div>
    );
  })}
</div>)
};

type PsychedelicProps = {
  children?: React.ReactNode;
  data?: any;
  hidden: boolean;
  isRent: boolean;
}


// const getProduct = useCallback(async (): Promise<void> => {
//   const nftInfo = await request(endpoint, productQuery(nftId));
//   setProduct(nftInfo.product);
//   console.log(nftInfo.product);
// }, [nftId]);

const Psychedelic: React.FC<PsychedelicProps> = ({ children, hidden, isRent }) => {
  const [data, setData] = useState();
  const { wallet, web3 } = useContext(DappContext);
  const fetchNfts = useCallback(async () => {
    if (isRent) {
      const data = await request(ENDPOINT, nftsQuery());
      if ('nfts' in data && data['nfts'].length !== 0) {
        setData(data['nfts']);
      }
    } else {
      // lend. so pull all the nfts that you own
      if (wallet.account == null || web3 == null) {
        console.error("connect to goerli network");
        return;
      }
      const userNftsQuery = userQuery(wallet.account, web3);
      const data = await request(ENDPOINT, userNftsQuery);
      console.log("data");
      console.log(data);
      setData(data);
    }
  }, [wallet.account, web3]);

  useEffect(() => {
    fetchNfts();
  }, [wallet.account, web3]);

  const btnActionLabel = isRent ? "Rent" : "Lend";

  return (
    !hidden && (<>
        {data && <ScrollForMore />}
        {data && <Catalogue data={data} btnActionLabel={btnActionLabel} />}
        {(children && data == null) && children}
      </>)
  );
};

export default Psychedelic;
