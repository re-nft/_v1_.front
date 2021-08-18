import moment from "moment";
import React, { useEffect, useState } from "react";

const MILISECONDS_IN_DAY = 24 * 60 * 60 * 1000;
const MILISECONDS_IN_HOUR = 60 * 60 * 1000;
const MILISECONDS_IN_MINUTE = 60 * 1000;
const MILISECONDS_IN_SECOND = 1000;

export const CountDown: React.FC<{ endTime: number }> = ({ endTime }) => {
  const [{ days, hours, minutes, seconds }, setRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const time = endTime - moment().toDate().getTime();
      const days = time / MILISECONDS_IN_DAY;
      const hours = (time % MILISECONDS_IN_DAY) / MILISECONDS_IN_HOUR;
      const minutes = (time % MILISECONDS_IN_HOUR) / MILISECONDS_IN_MINUTE;
      const seconds = (time % MILISECONDS_IN_MINUTE) / MILISECONDS_IN_SECOND;
      setRemaining({
        days: parseInt(days.toString(), 10),
        hours: parseInt(hours.toString(), 10),
        minutes: parseInt(minutes.toString(), 10),
        seconds: parseInt(seconds.toString(), 10),
      });
    }, 1000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [endTime]);

  if (endTime <= Date.now()) {
    return <div>Expired!</div>;
  }
  return (
    <div className="flex items-end content-center">
      <span className="flex">{days}d&nbsp;</span>
      <span className="flex">{hours}h&nbsp;</span>
      <span className="flex">{minutes}m&nbsp;</span>
      <span className="flex">{seconds}s</span>
    </div>
  );
};
