import React from "react";
import { CatalogueItemRow } from "../catalogue-item/catalogue-item-row";

const leaderboardData = [
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    renting: 1320,
    lending: 543,
  },
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    renting: 324,
    lending: 199,
  },
  {
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    renting: 290,
    lending: 74,
  },
  {
    address: "0x7XG4CdDdB6a900fa2b585dd299e03d12FA4293BC",
    renting: 1,
    lending: 1,
  },
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    renting: 1,
    lending: 1,
  },
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    renting: 1,
    lending: 1,
  },
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    renting: 1,
    lending: 1,
  },
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    renting: 1,
    lending: 1,
  },
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    renting: 1,
    lending: 1,
  },
  {
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    renting: 1,
    lending: 1,
  },
];

const Leaderboard: React.FC = () => {
  const [one, two, three] = leaderboardData.slice(0).slice(0, 3);
  const rest = leaderboardData.slice(3);
  return (
    <div className="flex relative flex-col py-4 min-h-screen w-full">
      <div className="">
        <div className="leaderboard-leader">
          <div className="leaderboard-leader-item">
            <div className="img"></div>
            <div className="result">
              <div>#</div>
              <div>2</div>
            </div>
            <div className="name">{two.address}</div>
            <div className="stat">
              <CatalogueItemRow text="Renting" value={two.renting} />
              <CatalogueItemRow text="Lending" value={two.lending} />
            </div>
          </div>
          <div className="leaderboard-leader-item first">
            <div className="img"></div>
            <div className="result">
              <div>#</div>
              <div>1</div>
            </div>
            <div className="name">{one.address}</div>
            <div className="stat">
              <CatalogueItemRow text="Renting" value={one.renting} />
              <CatalogueItemRow text="Lending" value={one.lending} />
            </div>
          </div>
          <div className="leaderboard-leader-item">
            <div className="img"></div>
            <div className="result">
              <div>#</div>
              <div>3</div>
            </div>
            <div className="name">{three.address}</div>
            <div className="stat">
              <CatalogueItemRow text="Renting" value={three.renting} />
              <CatalogueItemRow text="Lending" value={three.lending} />
            </div>
          </div>
        </div>
        <div className="leaderboard-list">
          {rest.map((item, index) => (
            <div key={index} className="leaderboard-list-item">{`#${
              4 + index
            }   ${item.address}`}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
