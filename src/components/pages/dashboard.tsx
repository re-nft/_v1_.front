// const Dashboard: React.FC = () => {
//   const usersLending: Lending[] = [];
//   const usersRenting: Renting[] = [];

//   return (
//     <Box
//       style={{ display: "flex", flexDirection: "column", padding: "1.5rem 0" }}
//     >
//       <Box style={{ padding: "1rem" }}>
//         <h2>Lending</h2>
//         <Table>
//           <TableHead tableType={TableType.LEND} />
//           <tbody>
//             {usersLending.length > 0 &&
//               usersLending.map((l) => {
//                 return (
//                   <TableRow
//                     key={`${l.address}::${l.tokenId}::${l.lending.id}`}
//                     address={l.address}
//                     tokenId={String(l.tokenId)}
//                     id={String(l.lending.id)}
//                     dailyPrice={`${
//                        PaymentToken[l.lending.paymentToken ?? 0]
//                     } ${String(l.lending.dailyRentPrice)}`}
//                     collateral={`${
//                        PaymentToken[l.lending.paymentToken ?? 0]
//                     } ${String(l.lending.nftPrice)}`}
//                     maxDuration={String(l.lending.maxRentDuration)}
//                     claim={<ClaimButton lending={l} />}
//                     // todo
//                     // greenHighlight={Boolean(l.renting)}
//                   />
//                 );
//               })}
//           </tbody>
//         </Table>
//       </Box>
//       <Box style={{ padding: "1rem" }}>
//         <h2>Renting</h2>
//         <Table>
//           <TableHead tableType={TableType.BORROW} />
//           <tbody>
//             {usersRenting.length > 0 &&
//               usersRenting.map((r) => (
//                 <TableRow
//                   key={`${r.address}::${r.tokenId}::${r.renting.id}`}
//                   address={r.address}
//                   tokenId={String(r.tokenId)}
//                   id={String(r.renting.id)}
//                   // dailyPrice={`${
//                   //   PaymentToken[r.renting.paymentToken ?? 0]
//                   // } ${String(r.lending.dailyRentPrice)}`}
//                   // collateral={`${
//                   //   PaymentToken[r.lending.paymentToken ?? 0]
//                   // } ${String(r.lending.nftPrice)}`}
//                   dailyPrice={"0"}
//                   collateral={"0"}
//                   maxDuration={String(
//                     returnBy(
//                       r.renting.rentedAt ?? 0,
//                       r.renting.rentDuration ?? 0
//                     )
//                   )}
//                 />
//               ))}
//           </tbody>
//         </Table>
//       </Box>
//     </Box>

import React, { useState, useCallback, useContext, useEffect } from "react";
import moment from "moment";
import PageLayout from "../layout/page-layout";
import GraphContext from "../../contexts/graph/index";
import { Lending, Nft, Renting } from "../../contexts/graph/classes";
import createCancellablePromise from '../../contexts/create-cancellable-promise';
import CatalogueLoader from "../catalogue/components/catalogue-loader";
import { PaymentToken } from "../../types";
import { RentNftContext } from "../../hardhat/SymfoniContext";

const returnBy = (rentedAt: number, rentDuration: number) => {
  return moment.unix(rentedAt).add(rentDuration, "days");
};

enum DashboardSpecificity {
  LIST_VIEW,
  MINIATURE_VIEW,
}

const LendingTableHead: React.FC = () => (
  <thead>
    <th style={{ width: '5%' }}>Name</th>
    <th style={{ width: '30%' }}>NFT Address</th>
    <th style={{ width: '5%' }}>TokenId</th>
    <th style={{ width: '10%' }}>ERC20 Payment</th>
    <th style={{ width: '7%' }}>Duration</th>
    <th style={{ width: '7%' }}>% Complete</th>
    <th style={{ width: '10%' }}>Collateral Paid</th>
    <th style={{ width: '6%' }}>Rent Paid</th>
    <th style={{ width: '20%' }} className="action-column">&nbsp;</th>
  </thead>
);

export const Dashboard: React.FC = () => {
  const { getUserLending, getUserRenting } = useContext(GraphContext);
  const { instance: renft } = useContext(RentNftContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lendingItems, setLendingItems] = useState<Lending[]>([]);
  const [rentingItems, setRentingItems] = useState<Renting[]>([]);
  const [specificity, setSpecificiy] = useState<DashboardSpecificity>(
    DashboardSpecificity.LIST_VIEW
  );
  
  const handleClaim = useCallback(async (lending: Lending) => {
    if (!renft) return;

    await renft
      .claimCollateral(
        [lending.address],
        [lending.tokenId],
        // @ts-ignore
        [lending.lending?.[-1]]
      )
      .catch(() => false);
  }, [renft]);

  const handleStopLend = useCallback(async (lending: Lending) => {
    if (!renft) return;

    await renft.stopLending(
      [lending.address],
      [lending.tokenId],
      // @ts-ignore
      [lending.lending?.[-1]]
    );
  }, [renft]);

  const _now = moment();
  const _returnBy = (lending: Lending) => returnBy(
    // @ts-ignore
    lending.renting?.rentedAt,
    // @ts-ignore
    lending.renting?.rentDuration
  );
  const _claim = (lending: Lending) => _now.isAfter(_returnBy(lending));
  
  const switchSpecificity = useCallback(() => {
    setSpecificiy((specificity) =>
      specificity === DashboardSpecificity.LIST_VIEW
        ? DashboardSpecificity.MINIATURE_VIEW
        : DashboardSpecificity.LIST_VIEW
    );
  }, []);

  useEffect(() => {
    setIsLoading(true);

    const getUserLendingRequest = createCancellablePromise(
      Promise.all([
        getUserLending(),
        getUserRenting()
      ])  
    );

    getUserLendingRequest.promise.then(([userLnding, userRenting]) => {
      setLendingItems(userLnding || []);
      setRentingItems(userRenting || []);
      setIsLoading(false);
    });
    
    return getUserLendingRequest.cancel;
  }, []);
  
  if (isLoading) {
    return <CatalogueLoader />;
  }

  if (!isLoading && lendingItems.length === 0 && rentingItems.length === 0) {
    return (
      <div className="center">
        You dont have any lending and renting anything yet
      </div>
    )
  }
  console.log(lendingItems);
  return (
    <PageLayout
      title={specificity.valueOf() === 0 ? "LIST VIEW" : "MINIATURE VIEW"}
      toggleValue={specificity === DashboardSpecificity.LIST_VIEW}
      onSwitch={switchSpecificity}
    >
      {specificity === DashboardSpecificity.LIST_VIEW && (
        <div className="dashboard-list-view">
          {lendingItems.length !== 0 && !isLoading && (
            <div className="dashboard-section">
              <h2 className="lending">Lending</h2>
              <table className="list">
                <LendingTableHead />
                <tbody>
                {lendingItems.map((lend: Lending) => {
                  const lending = lend.lending;
                  return (
                    <tr key={`${lend.address}::${lend.tokenId}::${lending.id}`}>
                       <td className="column">-//-</td> 
                       <td className="column">{lending.nftAddress}</td> 
                       <td className="column">{lend.tokenId}</td> 
                       <td className="column">{PaymentToken[lending.paymentToken ?? 0]}</td> 
                       <td className="column">{lending.maxRentDuration}</td> 
                       <td className="column">-//-</td> 
                       <td className="column">{lending.collateralClaimed}</td> 
                       <td className="column">{lending.dailyRentPrice}</td> 
                       <td className="action-column">
                         {_claim(lend) 
                          ? <span className="nft__button" onClick={() => handleClaim(lend)}>💰</span> 
                          : <span className="nft__button" onClick={() => handleStopLend(lend)}>Stop lend</span>
                        }
                       </td>
                    </tr>
                  )
                })}
                </tbody>
              </table>
            </div>
          )}
          {rentingItems.length !== 0 && !isLoading && (
            <div className="dashboard-section">
              <h2 className="renting">Renting</h2>
            </div> 
          )}
        </div>
      )}
      {specificity === DashboardSpecificity.MINIATURE_VIEW && <div>miniature</div>}
    </PageLayout>
  );
};

export default React.memo(Dashboard);