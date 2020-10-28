import React from "react";

import SweetProgress from "./SweetProgress";

export default ({ hidden }) => {
  return (
    !hidden && (
      <div>
        <div className="coming-soon" title="Coming Soon,">
          Coming Soon,
        </div>
        <div className="coming-soon" title="it will look">
          it will look
        </div>
        <div className="coming-soon" title="fab">
          fab
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>Total earned from lending: $1222 (in rent prices)</div>
          <div># of NFTs currently lending: 3</div>
          <div># of NFTS currently renting: 1</div>
          <div>Earning: dynamic numbers</div>
          <div>Spending: dynamic numbers</div>

          <div>------------------</div>
          <div>Currently Lending</div>
          <div>------------------</div>
          <div style={{ display: "flex" }}>
            <div>
              1. 0x423...455/234 @ $10 per day | day: 1 | earned: $3 &nbsp;{" "}
            </div>
            <div>
              <SweetProgress />
            </div>
          </div>
          <div style={{ display: "flex" }}>
            {" "}
            2. 0xf19...dcd/1 @ $5 per day | day: 10 | earned: $51 &nbsp;{" "}
            <SweetProgress />
          </div>
          <div style={{ display: "flex" }}>
            {" "}
            3. 0xaa2...ba8/21 @ $3 per day | day: 5 | earned: $16 &nbsp;{" "}
            <SweetProgress />
          </div>
          <div>------------------</div>
          <div>Currently Renting</div>
          <div>------------------</div>
          <div style={{ display: "flex" }}>
            <div>
              1. 0xaaa...ddd/1 @ $100 per day | day: 1 | spent: $55 &nbsp;{" "}
            </div>
            <div>
              <SweetProgress />
            </div>
          </div>
        </div>
      </div>
    )
  );
};
