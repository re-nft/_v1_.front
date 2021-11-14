import React from "react";
import { MulticallUpdater } from "./MultiCallUpdater";
import { ApplicationUpdater } from "./ApplicationUpdater";
import { TransactionUpdater } from "./TransactionUpdater";

export function Updaters() {
  return (
    <>
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
    </>
  );
}
