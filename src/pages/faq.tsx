import React from "react";

const ButHow: React.FC = () => {
  return (
    <div className="text-content copy-text">
      <img src="assets/faq/how-to-lend-an-nft.png" />
      <p>
        You just <b className="bolder headline">have that NFT</b> sitting around{" "}
        <b className="bolder headline">not doing much</b>?
      </p>
      <p>
        We know how you can earn <b className="bolder headline">extra income</b>!
      </p>

      <div>
        Head out to the Lend tab above and lend your NFT. This will require you
        to:
      </div>
      <div>(i) set the price for your NFT</div>
      <div>
        (ii) decide on the maximum amount of days you wish to rent it out for
      </div>
      <div>(iii) amount to charge the borrower per day of renting</div>
      <br />
      <img src="assets/faq/how-to-rent-an-nft.png" />
      <p>
        We will ask the borrower to pay the price you indicated in
        (i) if they
        want to rent your NFT. This means that if they do not return your NFT,
        you get back this money. As with everything in life, all good things
        must come to an end. So we will enforce the borrower to return your NFT
        before the end of their picked rent duration (which must not exceed what
        you have set in (ii)). If they miss their deadline, the price they have
        paid into our escrow in (i) will be automatically sent to you. As for
        the last point (iii), this is how much the borrower will pay you every
        day that they are renting your NFT
      </p>

      <img src="assets/faq/what-are-the-risks.png" />
      <br />
      The contracts were not audited. However, they have been thoroughly tested and peer reviewed, exercise caution, all responsibility due to loss bares with the users of the app.
    </div>
  );
};

export default ButHow;
