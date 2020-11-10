import React from "react";
import { Tooltip, Box } from "@material-ui/core";
import Identicon from "identicon.js";

type LeaderboardProps = {
  hidden: boolean;
};

const Leaderboard: React.FC<LeaderboardProps> = ({ hidden }) => {
  if (hidden) {
    return <></>;
  }

  const data = new Identicon("0x59aCDb1115abc2a81A9Be80fBCeD5a").toString();
  const data1 = new Identicon("0xk32j4knf239ir2j3fo23jof32fjkfj").toString();
  const data2 = new Identicon("0xaac3333221144dd09F38ccc01e1c20").toString();
  const data3 = new Identicon("0x00D03D154845503E9D16C4832f9").toString();
  const data4 = new Identicon("0x000D0D15305503E9D16C4832f9").toString();
  const data5 = new Identicon("0x000000D0D124805503E9D16C4832f9").toString();
  const data6 = new Identicon("0x000000D0D15314805503E9D16C4832f9").toString();
  const data7 = new Identicon("0x000000D154324805503E9D16C4832f9").toString();
  const data8 = new Identicon("0x00000012333454805503E9D16C32f9").toString();
  const data9 = new Identicon("0x000000D0D3334805503E9D16C4832f9").toString();

  return (
    <Box style={{ padding: "2rem" }}>
      <div className="center">
        <div className="top3">
          <div className="two item">
            <div className="pos">2</div>
            <div className="pic">
              <img src={`data:image/png;base64,${data}`} />
            </div>
            <Tooltip title="0xk32j4knf239ir2j3fo23jof32fjkfj">
              <div className="name">0xk32j4k...</div>
            </Tooltip>
            <div className="score">10233</div>
          </div>
          <div className="two item">
            <div className="pos">1</div>
            <div className="pic">
              <img src={`data:image/png;base64,${data1}`} />
            </div>
            <Tooltip title="0x000001D0D124805503E9D16C4832f9">
              <div className="name">0x000001...</div>
            </Tooltip>
            <div className="score">6794</div>
          </div>
          <div className="three item">
            <div className="pos">3</div>
            <div className="pic">
              <img src={`data:image/png;base64,${data2}`} />
            </div>
            <Tooltip title="0x000000D0D124805503E9D16C4832f9">
              <div className="name">0x000000...</div>
            </Tooltip>
            <div className="score">6034</div>
          </div>
        </div>
        <div className="list">
          <div className="item">
            <div className="pos">4</div>
            <div className="pic">
              <img src={`data:image/png;base64,${data3}`} />
            </div>
            <div className="name">0x000D0D15305503E9D16C4832f9</div>
            <div className="score">5980</div>
          </div>
          <div className="item">
            <div className="pos">5</div>
            <div className="pic">
              <img src={`data:image/png;base64,${data4}`} />
            </div>
            <div className="name">0xk32j4knf239ir2j3fo23jof32fjkfj</div>
            <div className="score">5978</div>
          </div>
          <div className="item">
            <div className="pos">6</div>
            <div className="pic">
              <img src={`data:image/png;base64,${data5}`} />
            </div>
            <div className="name">0x000000D154324805503E9D16C4832f9</div>
            <div className="score">5845</div>
          </div>
          <div className="item">
            <div className="pos">7</div>
            <div className="pic">
              <img src={`data:image/png;base64,${data6}`} />
            </div>
            <div className="name">0xaac3333221144dd09F38ccc01e1c20</div>
            <div className="score">5799</div>
          </div>
          <div className="item">
            <div className="pos">8</div>
            <div className="pic">
              <img src={`data:image/png;base64,${data7}`} />
            </div>
            <div className="name">0xaac3333221144dd09F38ccc01e1c20</div>
            <div className="score">5756</div>
          </div>
          <div className="item">
            <div className="pos">9</div>
            <div className="pic">
              <img src={`data:image/png;base64,${data8}`} />
            </div>
            <div className="name">0xaac3333221144dd09F38ccc01e1c20</div>
            <div className="score">5713</div>
          </div>
          <div className="item">
            <div className="pos">10</div>
            <div className="pic">
              <img src={`data:image/png;base64,${data9}`} />
            </div>
            <div className="name">0xaac3333221144dd09F38ccc01e1c20</div>
            <div className="score">5674</div>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default Leaderboard;
