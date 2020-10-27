import React from "react";

import ScrollForMore from "../components/ScrollForMore";

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

const Psychedelic: React.FC<PsychedelicProps> = ({ children, data, hidden, isRent }) => {
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
