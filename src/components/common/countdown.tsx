import React, { useEffect, useState, useMemo } from "react";

import { classNames } from "renft-front/utils";
import { useTimestamp } from "renft-front/hooks/misc/useTimestamp";

const MILISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
const MILISECONDS_IN_HOUR = 60 * 60 * 1000;
const MILISECONDS_IN_MINUTE = 60 * 1000;
const MILISECONDS_IN_SECOND = 1000;

export const CountDown: React.FC<{ endTime: number; claimed: boolean }> = ({
  endTime,
  claimed,
}) => {
  const [{ days, hours, minutes, seconds, closeToDeadline }, setRemaining] =
    useState({
      days: 0,
      hours: '0',
      minutes: '0',
      seconds: '0',
      closeToDeadline: false,
    });

  const blockTimeStamp = useTimestamp();
  const ttime = useMemo(() => {
    if (endTime < blockTimeStamp) return 0;
    return endTime - blockTimeStamp + Date.now();
  }, [endTime, blockTimeStamp]);

  useEffect(() => {
    if (ttime - Date.now() < 0) return;

    const interval = setInterval(() => {
      const time = ttime - Date.now();
      const days = time / MILISECONDS_IN_DAY;
      const hours = (time % MILISECONDS_IN_DAY) / MILISECONDS_IN_HOUR;
      const minutes = (time % MILISECONDS_IN_HOUR) / MILISECONDS_IN_MINUTE;
      const seconds = (time % MILISECONDS_IN_MINUTE) / MILISECONDS_IN_SECOND;
      const h = parseInt(hours.toString(), 10);
      const m = parseInt(minutes.toString(), 10);
      const s = parseInt(seconds.toString(), 10);
      setRemaining({
        days: parseInt(days.toString(), 10),
        hours: h < 10 ? `0${h}` : h.toString(),
        minutes: m < 10 ? `0${m}` : m.toString(),
        seconds: s < 10 ? `0${s}` : s.toString(), 
        closeToDeadline: days < 1 && hours < 2,
      });
      if (time < 0) clearInterval(interval);
    }, 1000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [ttime]);
  if (claimed) {
    return (
      <div className="text-3xl uppercase bg-rn-red-dark justify-center content-center text-center">
        Claimed
      </div>
    );
  }

  if (ttime - Date.now() < 0) {
    return (
      <div className="text-3xl uppercase bg-rn-red-dark justify-center content-center text-center">
        Defaulted
      </div>
    );
  }
  return (
    <div
      className={classNames(
        closeToDeadline && "bg-rn-red-dark",
        !closeToDeadline && "bg-rn-purple",
        "flex justify-center content-center text-3xl text-center uppercase"
      )}
    >
      <span className="flex">{days}d&nbsp;</span>
      <span className="flex">{hours}h&nbsp;</span>
      <span className="flex">{minutes}m&nbsp;</span>
      <span className="flex">{seconds}s</span>
    </div>
  );
};
