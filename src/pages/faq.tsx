import React from "react";

const ButHow: React.FC = () => {
  return (
    <div className="p-8 text-2xl leading-tight text-white font-body">
      <div style={{ marginBottom: "1em" }}>
        <img src="assets/faq/how-to-lend-an-nft.png" />
      </div>
      <div>
        Head out to the LEND tab above. Pick an NFT you would like to lend. You
        will get a modal like this. Let&apos;s go through it together to
        understand what each piece of information here means.
        <div style={{ marginTop: "1em", textAlign: "center" }}>
          <img src="assets/faq/lend-modal.png" />
        </div>
        <div>
          <img src="assets/faq/bullet-1.png" />
          &nbsp;<b className="font-display text-sm">NFT standard</b>. This is
          the NFT standard. There are 2 main standards out there: 721 and 1155.
          The 1155 standard lets you mint semi-fungible NFTs, which means that
          you have more than one NFT that looks the same, even though, they
          would have the same id. ReNFT protocol allows you to lend multiple
          amounts of this standard. But you need to understand a couple of
          things, before you lend such an NFT. We shall explain the nuances
          below.
        </div>
        <br />
        <div>
          <img src="assets/faq/bullet-2.png" />
          &nbsp;<b className="font-display text-sm">NFT address.</b> NFT address
          of the NFT you are about to lend.
        </div>
        <br />
        <div>
          <img src="assets/faq/bullet-3.png" />
          &nbsp;<b className="font-display text-sm">Token ID.</b> Token ID of
          the NFT you are about to lend.
        </div>
        <br />
        <div>
          <img src="assets/faq/bullet-4.png" />
          &nbsp;<b className="font-display text-sm">Available amount.</b> For
          1155 standard, this number will tell you how many copies of this
          semi-fungible NFT you have. For 721s, this is always 1. This number
          tells you the maximum number of NFTs that you can lend.
        </div>
        <br />
        <div>
          <img src="assets/faq/bullet-5.png" />
          &nbsp;<b className="font-display text-sm">Lend amount.</b> In this
          example, we will only lend 2 copies. For 721s, you can not set this
          number, since there is only ever 1 copy, so it will be disabled for
          you by default.
        </div>
        <br />
        <div>
          <img src="assets/faq/bullet-6.png" />
          &nbsp;<b className="font-display text-sm">Max lend duration.</b> It is
          imperative that you understand that this is the maximum number of days
          that your NFT can be rented out for by someone else. Therefore, be
          careful not to set it for too long, because if the floor price of the
          NFT rises, the renter may choose to not return the NFT. Think of
          lending as selling a call contract with a strike price of the
          collateral. If the floor price during the rent goes up to 2 ETH and
          you have set the collateral price at 1 ETH, then there is obviously a
          profit of 1 ETH for the renter. Therefore, it is important to actively
          monitor the market and update your lending when required. Another good
          way to manage this risk is to set a small max lend duration, such that
          it is less likely that the floor price goes up during the rent.
        </div>
        <br />
        <div>
          <img src="assets/faq/bullet-7.png" />
          &nbsp;<b className="font-display text-sm">Borrow price.</b> How much
          the renter will pay you per day for renting the NFT. The payments are
          accrued per second. If you return the NFT earlier, the correct amounts
          will be compensated back to you. Keep in mind, that when renter rents,
          they will pay both the full amount of rent, as well as collateral.
          This will go into the reNFT contract for escrow. In this example, the
          renter will have to pay 0.01 WETH per day to rent
          <b> ALL (2 copies)</b> of the NFTs we are lending here. Also note, due
          to the design of the contract, the numbers are limited to 4 decimal
          places for both the borrow price and the collateral. Also, note, that
          the whole number cannot exceed 4 digits. This means that the max
          number is 9999.9999 and the min number is 0.0001.
        </div>
        <br />
        <div>
          <img src="assets/faq/bullet-8.png" />
          &nbsp;<b className="font-display text-sm">Collateral PER COPY</b>.
          Collateral if the standard is 1155. In this example, the collateral is
          200 WETH. However, since the standard is 1155, the renter will pay 2 *
          200 WETH. This is a crucial distinction versus 721.{" "}
          <b>KEEP THIS IN MIND</b> when lending the 1155 standard!
        </div>
        <br />
        <div>
          <img src="assets/faq/bullet-9.png" />
          &nbsp;<b className="font-display text-sm">Payment token</b>, we
          support WETH and a bunch of other stablecoins.
        </div>
        <br />
        <div>
          <img src="assets/faq/bullet-10.png" />
          &nbsp;<b className="font-display text-sm">Action button.</b> If this
          is the first time you are lending a particular NFT, you will need to
          approve it. Only after approval, will you be able to lend it. So keep
          this in mind, you may need to issue two transactions on the first time
          around the NFT interacts with the ReNFT contract.
        </div>
        <br />
      </div>
      <div style={{ marginBottom: "1em" }}>
        <img src="assets/faq/how-to-rent-an-nft.png" />
      </div>
      <div>
        Head out to the RENT tab above. Pick an NFT you would like to rent. You
        will get a modal like this. Let&apos;s go through it together to
        understand what each piece of information here means.
        <div style={{ marginTop: "1em", textAlign: "center" }}>
          <img src="assets/faq/rent-modal.png" />
        </div>
      </div>
      <div>
        <img src="assets/faq/bullet-1.png" />
        &nbsp;<b className="font-display text-sm">NFT standard</b>. This is the
        NFT standard. There are 2 main standards out there: 721 and 1155. The
        1155 standard lets you mint semi-fungible NFTs, which means that you
        have more than one NFT that looks the same, even though, they would have
        the same id.
      </div>
      <br />
      <div>
        <img src="assets/faq/bullet-2.png" />
        &nbsp;<b className="font-display text-sm">NFT address.</b> NFT address
        of the NFT you are about to rent.
      </div>
      <br />
      <div>
        <img src="assets/faq/bullet-3.png" />
        &nbsp;<b className="font-display text-sm">Token ID.</b> Token ID of the
        NFT you are about to rent.
      </div>
      <br />
      <div>
        <img src="assets/faq/bullet-4.png" />
        &nbsp;<b className="font-display text-sm">Rent amount.</b> For 1155
        standard, this number will tell you how many copies of this
        semi-fungible NFT the lender is lending. The collateral you will pay
        will be multiplied by this number.
      </div>
      <br />
      <div>
        <img src="assets/faq/bullet-5.png" />
        &nbsp;<b className="font-display text-sm">Rent duration.</b> The length
        of the rent. If you fail to return the NFT by the end of this period,
        the lender will be able to claim the collateral you will pay.
      </div>
      <br />
      <div>
        <img src="assets/faq/bullet-6.png" />
        &nbsp;<b className="font-display text-sm">Daily rent price.</b> Total
        daily rent price for all the NFTs.
      </div>
      <br />
      <div>
        <img src="assets/faq/bullet-7.png" />
        &nbsp;<b className="font-display text-sm">Collateral PER COPY</b>.
        Collateral price per NFT. If this is a 721 standard, then this is a
        total collateral you have to pay. If this is 1155, then this is a per
        item collateral price. Note that you will have to pay full rent amount
        plus full collateral to rent. If you return earlier, the rent payment
        will be compensated proportionally. Collateral gets returned on
        successful return, as well.
      </div>
      <br />
      <div>
        <img src="assets/faq/bullet-8.png" />
        &nbsp;<b className="font-display text-sm">Total rent payable.</b>{" "}
        Depending on the standard and the number of days of the rent, this field
        will give you the total amount payable you will send to the reNFT
        contract for escrow.
      </div>
      <br />
      <div>
        <img src="assets/faq/bullet-9.png" />
        &nbsp;<b>Action button.</b> If this is the first time you are renting,
        you will need to approve the payment token for reNFT. You will only need
        to do this once, per payment token. This button will change to Rent,
        once you have approved the payment token.
      </div>
      <br />
      <br />
      <div style={{ marginBottom: "1em" }}>
        <img src="assets/faq/what-are-the-risks.png" />
      </div>
      <br />
      The contracts were not audited. However, they have been thoroughly tested
      and peer reviewed, exercise caution, all responsibility due to loss bares
      with the users of the app.
    </div>
  );
};

export default ButHow;
