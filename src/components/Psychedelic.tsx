import React, { useContext, useEffect, useState, useCallback } from "react";

import ScrollForMore from "../components/ScrollForMore";
import DappContext from "../contexts/Dapp";
import { ENDPOINT, nftsQuery } from "../api/graph";
import { request } from "graphql-request";

export const Catalogue = ({data, btnActionLabel}) => (
  <div className="Catalogue">
  {data.allCustomApi.edges[0].node.assets.map((product) => {
    return (
      <div className="Catalogue__item" key={product.token_id}>
        <div
          className="Product snipcart-add-item"
          data-item-id={product.token_id}
          data-item-price="10"
          data-item-image={product.image_url}
          data-item-name="a"
          data-item-url={`/`}
        >
          <div className="Product__image">
            <img alt="nft" src={product.image_original_url} />
            {/* <Img key={product.token_id} fluid /> */}
            {/* <Img sizes={product.image.sizes} /> */}
          </div>
          <div className="Product__details">
            <div className="Product__name">
              {/* {product.asset_contract.address} */}
              <div className="Product__price">10 €</div>
            </div>
            <span className="Product__buy">{btnActionLabel} now</span>
          </div>
        </div>
      </div>
    );
  })}
</div>
);

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
    const data = await request(ENDPOINT, nftsQuery());
    if ('nfts' in data && data['nfts'].length !== 0) {
      setData(data['nfts']);
    }
  }, []);

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
