import React from "react";
import Timer from "react-compound-timer";

interface TimerProps {
  /** Timer count direction */
  direction?: "forward" | "backward";
  /** Inittial time on timer */
  initialTime?: number;
  /** Time to rerender */
  timeToUpdate?: number;
  /** Start timer immediately after render */
  startImmediately?: boolean;
  /** Function to format all values */
  formatValue?: (value: number) => string;
  /** Function that will be called on timer start */
  onStart?: () => unknown;
  /** Function that will be called on timer resume */
  onResume?: () => unknown;
  /** Function that will be called on timer pause */
  onPause?: () => unknown;
  /** Function that will be called on timer stop */
  onStop?: () => unknown;
  /** Function that will be called on timer reset */
  onReset?: () => unknown;
  /** Last unit will accumulate time, for example, 26 hours or 90 seconds */
  lastUnit?: "ms" | "s" | "m" | "h" | "d";
  /** Time checkpoints with callback functions */
  checkpoints?: Array<{
    time: number;
    callback: () => unknown;
  }>;
}


const withTimer =
  (timerProps: TimerProps) =>
  <T extends Record<string, unknown>>(
    WrappedComponent: typeof React.Component
  ) =>
  // eslint-disable-next-line react/display-name
  (wrappedComponentProps: T) => {
    return (
      <Timer {...timerProps}>
        {(timerRenderProps: unknown) => (
          <WrappedComponent
            {...wrappedComponentProps}
            timer={timerRenderProps}
          />
        )}
      </Timer>
    );
  };

class TimerWrapper extends React.Component<{ timer: Date }> {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <Timer.Consumer>
        {() => {
          const time = this.props.timer.getTime();
          const date = new Date(time);
          const days = date.getDate();
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const seconds = date.getSeconds();
          return (
            <>
              <span>
                {days} {days > 1 ? "days" : "day"}{" "}
              </span>
              <span>
                {hours} {hours > 1 ? "hours" : "hour"}{" "}
              </span>
              <span>
                {minutes} {minutes > 1 ? "minutes" : "minute"}{" "}
              </span>
              <span>
                {seconds} {seconds > 1 ? "seconds" : "second"}
              </span>
            </>
          );
        }}
      </Timer.Consumer>
    );
  }
}

export const CountDown = ({ expiryDate }: { expiryDate: Date }): JSX.Element =>
  withTimer({
    initialTime: expiryDate.getTime(),
    direction: "backward"
  })(TimerWrapper)({});
