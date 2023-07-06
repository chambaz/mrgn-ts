import { MarginRequirementType } from "@mrgnlabs/marginfi-client-v2";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { FC, useMemo, useState, useEffect } from "react";
import { usdFormatter, percentFormatter, numeralFormatter, usdFormatterDyn } from "~/utils/formatters";
// import { AccountBalance, MobileHealth } from "./AccountBalance";
import { RewardMetric } from "./AccountMetric";
import { useUserAccounts } from "~/context";
import { Card, CardContent, Typography, Skeleton } from '@mui/material';
import BigNumber from "bignumber.js";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { ExtendedBankInfo } from "~/types";

const firebaseConfig = {
  apiKey: "AIzaSyBPAKOn7YKvEHg6iXTRbyZws3G4kPhWjtQ",
  authDomain: "marginfi-dev.firebaseapp.com",
  projectId: "marginfi-dev",
  storageBucket: "marginfi-dev.appspot.com",
  messagingSenderId: "509588742572",
  appId: "1:509588742572:web:18d74a3ace2f3aa2071a09"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const calculateTotalPoints = async () => {
  const pointsCollection = collection(db, 'points');
  const pointSnapshot = await getDocs(pointsCollection);
  let totalPoints = 0;

  pointSnapshot.forEach((doc) => {
    totalPoints += doc.data().total_points;
  });

  return totalPoints;
};

const AccountSummary: FC = () => {
  const { accountSummary, selectedAccount, extendedBankInfos } = useUserAccounts();
  const wallet = useWallet();

  const healthFactor = useMemo(() => {
    if (selectedAccount) {
      const { assets, liabilities } = selectedAccount.getHealthComponents(MarginRequirementType.Maint);
      return assets.isZero() ? 1 : assets.minus(liabilities).dividedBy(assets).toNumber();
    } else {
      return null;
    }
  }, [selectedAccount]);

  const calculateTotal = (bankInfos: ExtendedBankInfo[], field: string): number => {
    return bankInfos.reduce((accumulator: number, bankInfo: any) => accumulator + bankInfo[field] * bankInfo.tokenPrice, 0);
  };

  const globalDeposits = useMemo(() => calculateTotal(extendedBankInfos, 'totalPoolDeposits'), [extendedBankInfos]);
  const globalBorrows = useMemo(() => calculateTotal(extendedBankInfos, 'totalPoolBorrows'), [extendedBankInfos]);
  const globalTVL = useMemo(() => Math.max(globalDeposits - globalBorrows, 0), [globalDeposits, globalBorrows]);

  const [globalPoints, setGlobalPoints] = useState<number | null>(null);

  useEffect(() => {
    const calculateTotalPoints = async () => {
      const pointsCollection = collection(db, 'points');
      const pointSnapshot = await getDocs(pointsCollection);
      let totalPoints = 0;
      console.log(totalPoints)

      pointSnapshot.forEach((doc) => {
        totalPoints += doc.data().total_points ? parseFloat(doc.data().total_points) : 0;
      });

      setGlobalPoints(totalPoints);
    };

    calculateTotalPoints();
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-7xl gap-5 col-span-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 w-full">

        {/*******************************/}
        {/* [START]: GLOBAL METRICS */}
        {/*******************************/}

        <Card className="bg-[#131619] h-full h-24 rounded-xl" elevation={0}>
          <CardContent>
            <Typography color="#868E95" className="font-aeonik font-[300] text-base flex gap-1" gutterBottom>
              Global Supplied
              <div className="self-center">
              </div>
            </Typography>
            <Typography color="#fff" className="font-aeonik font-[500] text-3xl" component="div">
              {
                globalDeposits ?
                  `$${numeralFormatter(globalDeposits)}`
                  :
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    className="w-1/3 rounded-md top-[4px]"
                  />
              }
            </Typography>
          </CardContent>
        </Card>
        <Card className="bg-[#131619] h-full h-24 rounded-xl" elevation={0}>
          <CardContent>
            <Typography color="#868E95" className="font-aeonik font-[300] text-base" gutterBottom>
              Global Borrowed
            </Typography>
            <Typography color="#fff" className="font-aeonik font-[500] text-3xl" component="div">
              {
                globalBorrows ?
                  `$${numeralFormatter(globalBorrows)}`
                  :
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    className="w-1/3 rounded-md top-[4px]"
                  />
              }
            </Typography>
          </CardContent>
        </Card>
        <Card className="bg-[#131619] h-full h-24 rounded-xl" elevation={0}>
          <CardContent>
            <Typography color="#868E95" className="font-aeonik font-[300] text-base" gutterBottom>
              Global TVL
            </Typography>
            <Typography color="#fff" className="font-aeonik font-[500] text-3xl" component="div">
              {
                globalTVL ?
                  `$${numeralFormatter(globalTVL)}`
                  :
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    className="w-1/3 rounded-md top-[4px]"
                  />
              }
            </Typography>
          </CardContent>
        </Card>
        <Card className="bg-[#131619] h-full h-24 rounded-xl" elevation={0}>
          <CardContent>
            <Typography color="#868E95" className="font-aeonik font-[300] text-base flex gap-1" gutterBottom>
              Global Points
              <div className="self-center">
              </div>
            </Typography>
            <Typography color="#fff" className="font-aeonik font-[500] text-3xl" component="div">
              {
                globalPoints ?
                  numeralFormatter(globalPoints)
                  :
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    className="w-1/3 rounded-md top-[4px]"
                  />
              }
            </Typography>
          </CardContent>
        </Card>

        {/*******************************/}
        {/* [END]: GLOBAL METRICS */}
        {/*******************************/}

        {/*******************************/}
        {/* [ACCOUNT]: GLOBAL METRICS */}
        {/*******************************/}

        {
          wallet.connected &&
          <>
            <Card className="bg-[#131619] h-full h-24 rounded-xl" elevation={0}>
              <CardContent>
                <Typography color="#868E95" className="font-aeonik font-[300] text-base flex gap-1" gutterBottom>
                  Account Balance
                  <div className="self-center">
                  </div>
                </Typography>
                <Typography color="#fff" className="font-aeonik font-[500] text-3xl" component="div">
                  {
                    accountSummary.balance ?
                      <>
                        <div className="sm:hidden">
                          {`$${numeralFormatter(accountSummary.balance)}`}
                        </div>

                        <div className="hidden sm:block xl:hidden">
                          {
                            Math.round(accountSummary.balance) > 10000 ?
                              usdFormatterDyn.format(Math.round(accountSummary.balance))
                              :
                              usdFormatter.format(accountSummary.balance)
                          }
                        </div>

                        <div className="hidden xl:block">
                          {usdFormatter.format(accountSummary.balance)}
                        </div>
                      </>
                      :
                      <Skeleton
                        variant="rectangular"
                        animation="wave"
                        className="w-1/3 rounded-md top-[4px]"
                      />
                  }
                </Typography>
              </CardContent>
            </Card>
            <Card className="bg-[#131619] h-full h-24 rounded-xl" elevation={0}>
              <CardContent>
                <Typography color="#868E95" className="font-aeonik font-[300] text-base flex gap-1" gutterBottom>
                  Supplying
                  <div className="self-center">
                  </div>
                </Typography>
                <Typography color="#fff" className="font-aeonik font-[500] text-3xl" component="div">
                  {
                    accountSummary.lendingAmount ?
                      <>
                        <div className="sm:hidden">
                          {`$${numeralFormatter(accountSummary.lendingAmount)}`}
                        </div>

                        <div className="hidden sm:block xl:hidden">
                          {
                            Math.round(accountSummary.lendingAmount) > 10000 ?
                              usdFormatterDyn.format(Math.round(accountSummary.lendingAmount))
                              :
                              usdFormatter.format(accountSummary.lendingAmount)
                          }
                        </div>

                        <div className="hidden xl:block">
                          {usdFormatter.format(accountSummary.lendingAmount)}
                        </div>
                      </>
                      :
                      <Skeleton
                        variant="rectangular"
                        animation="wave"
                        className="w-1/3 rounded-md top-[4px]"
                      />
                  }
                </Typography>
              </CardContent>
            </Card>
            <Card className="bg-[#131619] h-full h-24 rounded-xl" elevation={0}>
              <CardContent>
                <Typography color="#868E95" className="font-aeonik font-[300] text-base flex gap-1" gutterBottom>
                  Borrowing
                  <div className="self-center">
                  </div>
                </Typography>
                <Typography color="#fff" className="font-aeonik font-[500] text-3xl" component="div">
                  {
                    accountSummary.borrowingAmount ?
                      <>
                        <div className="sm:hidden">
                          {`$${numeralFormatter(accountSummary.borrowingAmount)}`}
                        </div>

                        <div className="hidden sm:block xl:hidden">
                          {
                            Math.round(accountSummary.borrowingAmount) > 10000 ?
                              usdFormatterDyn.format(Math.round(accountSummary.borrowingAmount))
                              :
                              usdFormatter.format(accountSummary.borrowingAmount)
                          }
                        </div>

                        <div className="hidden xl:block">
                          {usdFormatter.format(accountSummary.borrowingAmount)}
                        </div>
                      </>
                      :
                      <Skeleton
                        variant="rectangular"
                        animation="wave"
                        className="w-1/3 rounded-md top-[4px]"
                      />
                  }
                </Typography>
              </CardContent>
            </Card>
            <Card className="bg-[#131619] h-full h-24 rounded-xl" elevation={0}>
              <CardContent>
                <Typography color="#868E95" className="font-aeonik font-[300] text-base flex gap-1" gutterBottom>
                  Health factor
                  <div className="self-center">
                  </div>
                </Typography>
                <Typography color="#fff" className="font-aeonik font-[500] text-3xl" component="div">
                  {
                    healthFactor ?
                      percentFormatter.format(new BigNumber(healthFactor).toNumber())
                      :
                      <Skeleton
                        variant="rectangular"
                        animation="wave"
                        className="w-1/3 rounded-md top-[4px]"
                      />
                  }


                </Typography>
              </CardContent>
            </Card>
          </>
        }

      </div>
    </div>
  );
};

export { AccountSummary };

// {/* </div> */}
// <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-5" style={{ border: 'solid red 1px' }}>
//   <RewardMetric
//     value={wallet.connected ? accountSummary.outstandingUxpEmissions.toExponential(5) : "-"}
//     marginfiAccount={selectedAccount}
//     extendedBankInfos={extendedBankInfos}
//   />
//   <AccountMetric
//     label={"Lending"}
//     value={wallet.connected ? usdFormatter.format(accountSummary.lendingAmount) : "-"}
//   />
//   <AccountMetric
//     label={"Borrowing"}
//     value={wallet.connected ? usdFormatter.format(accountSummary.borrowingAmount) : "-"}
//   />
// </div>
