import React, { useState, useCallback, useContext, useEffect } from "react";

import GraphContext from '../../contexts/graph/index';
import mooncatparser from '../../lib/mooncatparser';

function drawCat(catId: string, size: number){
    size = size || 10;
    const data = mooncatparser(catId);
    const canvas = document.createElement("canvas");
    canvas.width = size * data.length;
    canvas.height = size * data[1].length;
    const ctx = canvas.getContext("2d");

    for(let i = 0; i < data.length; i++){
        for(let j = 0; j < data[i].length; j++){
            const color = data[i][j];
            if(color && ctx){
                ctx.fillStyle = color;
                ctx.fillRect(i * size, j * size, size, size);
            }
        }
    }
    return canvas.toDataURL();
}

const CatItem: React.FC<{ catId: string }> = ({ catId }) => {
    const img = drawCat(catId, 10);
    const address = catId;

    return (
        <div className="nft" key={catId} data-item-id={catId}>
          <div className="nft__image">
              {img ? <img loading="lazy" src={img} /> : <div className="no-img">NO CAT</div>}
          </div>
          <div className="nft__meta"> 
            <div className="nft__meta_row">
              <div className="nft__meta_title">Cat id</div>
              <div className="nft__meta_dot"></div>
              <div className="nft__meta_value">{catId}</div>
            </div>
          </div>
        </div>
      );    
};

export const Cats: React.FC = () => {
  const { usersMoonCats } = useContext(GraphContext);
  const [cats, setCats] = useState<{ id: string; inMyWallet: boolean }[]>([]);  
  const [isCatLoaded, setIsCatLoaded] = useState<boolean>(false);  

  const onClick = useCallback(() => {
    setCats(usersMoonCats);
    setIsCatLoaded(true);
  }, [setCats, usersMoonCats]);

  useEffect(() => {
    setCats(usersMoonCats);
  }, [usersMoonCats]);

  const inMyWallet = cats.filter(({ inMyWallet }) => inMyWallet);
  const onTheMoon = cats.filter(({ inMyWallet }) => !inMyWallet);
  return (
    <div className="content">
      {!isCatLoaded && (
          <div className="content-center">
              <button className="nft__button" onClick={onClick}>
                  Show me my cats
              </button>
          </div>
      )}
      {isCatLoaded && cats.length === 0 && (
        <div className="no-cats">No cats? Did you only &apos;RescueCat&apos; and not &apos;GiveCat&apos; function as well?</div>
      )}  
      {isCatLoaded && inMyWallet.length !== 0 && (
        <>
          <h2 className="content-header">In My Wallet</h2>
          <div className="content__row content__items">
              {inMyWallet.map(({ id }) => <CatItem key={id} catId={id}/>)}
          </div>
        </>
      )}
      {isCatLoaded && onTheMoon.length !== 0 && (
        <>
          <h2 className="content-header">On The Moon</h2>
          <div className="content__row content__items">
            {onTheMoon.map(({ id }) => <CatItem key={id} catId={id}/>)}
          </div>
        </>
      )}
	  </div>
  );
};

export default Cats;