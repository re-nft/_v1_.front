import React from "react";

export default ({ hidden }) => {
  return (
    !hidden && (
      <div>
        You just{" "}
        <span style={{ fontStyle: "oblique", fontSize: "24px" }}>
          have that NFT
        </span>{" "}
        sitting around{" "}
        <span style={{ fontWeight: "bolder" }}>not doing much</span>?
        <br />
        <br />
        We know how you can earn{" "}
        <span style={{ fontWeight: "bold", fontSize: "24px" }}>
          extra income
        </span>
        !
        <br />
        <br />
        Head out to the Lend tab above and lend your NFT. This will require you
        to:
        <br />
        (i) set the price for your NFT
        <br />
        (ii) decide on the maximum amount of days you wish to rent it out for
        <br />
        (iii) amount to charge the borrower per day of renting
        <br />
        <br />
        We will ask the borrower to pay the price you indicated in (i) if they
        want to rent your NFT. This means that if they do not return your NFT,
        you get back this money.
        <br />
        As with everything in life, all good things must come to an end. So we
        will enforce the borrower to return your NFT before the end of their
        picked rent duration (which must not exceed what you have set in (ii)).
        If they miss their deadline, the price they have paid into our escrow in
        (i) will be automatically sent to you.
        <br />
        As for the last point (iii), this is how much the borrower will pay you
        every day that they are renting your NFT
        <br />
        <br />
        How can Rent NFT be useful?
        <br />
        <br />
        - bulk insurance buyer can offer individual insurance at a discount
        <br />
        - collectors can finish their collection for a showcase in an NFT art
        fair
        <br />- someone wants to earn some money with higher tier Axie
      </div>
    )
  );
};
