import React from "react";

export default ({ data, hidden, isRent }) => {
  const btnActionLabel = isRent ? "Rent" : "Lend";

  return (
    !hidden && (
      <>
        <ul className="c-rainbow">
          <li className="c-rainbow__layer c-rainbow__layer--white">
            SCROLL FOR MORE
          </li>
          <li className="c-rainbow__layer c-rainbow__layer--orange">
            SCROLL FOR MORE
          </li>
          <li className="c-rainbow__layer c-rainbow__layer--red">
            SCROLL FOR MORE
          </li>
          <li className="c-rainbow__layer c-rainbow__layer--violet">
            SCROLL FOR MORE
          </li>
          <li className="c-rainbow__layer c-rainbow__layer--blue">
            SCROLL FOR MORE
          </li>
          <li className="c-rainbow__layer c-rainbow__layer--green">
            SCROLL FOR MORE
          </li>
          <li className="c-rainbow__layer c-rainbow__layer--yellow">
            SCROLL FOR MORE
          </li>
        </ul>
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
      </>
    )
  );
};
