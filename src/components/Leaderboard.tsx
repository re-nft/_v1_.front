import Identicon from "identicon.js";
import React from "react";

type LeaderboardProps = {
  hidden: boolean;
};

const Leaderboard: React.FC<LeaderboardProps> = ({ hidden }) => {
  if (hidden) {
    return <></>;
  }

  const data = new Identicon("0x59aCDb1115abc2a81A9Be80fBCeD5a").toString();
  const data2 = new Identicon("0xaac3333221144dd09F18ccc01e1c20").toString();
  const data3 = new Identicon("0x000000D0D154805503E9D16C4832f9").toString();

  return (
    <div className="center">
      <div className="top3">
        <div className="two item">
          <div className="pos">2</div>
          <div className="pic">
            <img src={`data:image/png;base64,${data}`} />
          </div>
          <div className="name">Edgar Soto</div>
          <div className="score">6453</div>
        </div>
        <div className="two item">
          <div className="pos">1</div>
          <div className="pic">
            <img src={`data:image/png;base64,${data2}`} />
          </div>
          <div className="name">Clifford James</div>
          <div className="score">6794</div>
        </div>
        <div className="three item">
          <div className="pos">3</div>
          <div className="pic">
            <img src={`data:image/png;base64,${data3}`} />
          </div>
          <div className="name">Nevaeh Silva</div>
          <div className="score">6034</div>
        </div>
      </div>
      <div className="list">
        <div className="item">
          <div className="pos">4</div>
          <div
            className="pic"
            style={{
              backgroundImage:
                "url(&#39;https://randomuser.me/api/portraits/men/88.jpg&#39;)",
            }}
          ></div>
          <div className="name">Clayton Watson</div>
          <div className="score">5980</div>
        </div>
        <div className="item">
          <div className="pos">5</div>
          <div
            className="pic"
            style={{
              backgroundImage:
                "url(&#39;https://randomuser.me/api/portraits/women/29.jpg&#39;)",
            }}
          ></div>
          <div className="name">Debbie Lane</div>
          <div className="score">5978</div>
        </div>
        <div className="item">
          <div className="pos">6</div>
          <div
            className="pic"
            style={{
              backgroundImage:
                "url(&#39;https://randomuser.me/api/portraits/women/85.jpg&#39;)",
            }}
          ></div>
          <div className="name">Gabriella Steward</div>
          <div className="score">5845</div>
        </div>
        <div className="item">
          <div className="pos">7</div>
          <div
            className="pic"
            style={{
              backgroundImage:
                "url(&#39;https://randomuser.me/api/portraits/women/39.jpg&#39;)",
            }}
          ></div>
          <div className="name">Nina Perkins</div>
          <div className="score">5799</div>
        </div>
        <div className="item">
          <div className="pos">8</div>
          <div
            className="pic"
            style={{
              backgroundImage:
                "url(&#39;https://randomuser.me/api/portraits/men/77.jpg&#39;)",
            }}
          ></div>
          <div className="name">Dennis Henry</div>
          <div className="score">5756</div>
        </div>
        <div className="item">
          <div className="pos">9</div>
          <div
            className="pic"
            style={{
              backgroundImage:
                "url(&#39;https://randomuser.me/api/portraits/women/49.jpg&#39;)",
            }}
          ></div>
          <div className="name">Courtney Fuller</div>
          <div className="score">5713</div>
        </div>
        <div className="item">
          <div className="pos">10</div>
          <div
            className="pic"
            style={{
              backgroundImage:
                "url(&#39;https://randomuser.me/api/portraits/women/30.jpg&#39;)",
            }}
          ></div>
          <div className="name">Joan Wood</div>
          <div className="score">5674</div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
