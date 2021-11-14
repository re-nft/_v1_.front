import React, { ReactNode, useCallback, useContext, useEffect } from "react";
import { X } from "react-feather";
import { useSpring } from "react-spring";
import { animated } from "react-spring";
import { TransactionPopup } from "./TransactionPopup";
import { Web3StatusActions } from "../../index.provider";
import { PopupContent } from "../../types";

export const StyledClose = ({ onClick }: { onClick: () => void }) => {
  return (
    <X
      className="absolute right-3 top-3 hover:cursor-pointer"
      onClick={onClick}
    ></X>
  );
};

export const Popup = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className="relative inline-block p-4 overflow-hidden bg-white md:w-full pr-9"
      style={{ minWidth: "290px" }}
    >
      {children}
    </div>
  );
};

export const Fader = ({
  style: { width = "100%" },
  ...rest
}: {
  style: React.CSSProperties;
}) => {
  return (
    <div
      className="absolute left-0 mt-4 bg-gray-200 b-0"
      style={{ height: "2px", width }}
      {...rest}
    />
  );
};
const AnimatedFader = animated(Fader);

export function PopupItem({
  removeAfterMs,
  content,
  popKey,
}: {
  removeAfterMs: number | null;
  content: PopupContent;
  popKey: string;
}) {
  const { removePopup } = useContext(Web3StatusActions);
  const removeThisPopup = useCallback(
    () => removePopup(popKey),
    [popKey, removePopup]
  );
  useEffect(() => {
    if (removeAfterMs === null) return undefined;

    const timeout = setTimeout(() => {
      removeThisPopup();
    }, removeAfterMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [removeAfterMs, removeThisPopup]);

  let popupContent;
  if ("txn" in content) {
    const {
      txn: { hash, success, summary },
    } = content;
    popupContent = (
      <TransactionPopup hash={hash} success={success} summary={summary} />
    );
  }

  const faderStyle = useSpring({
    from: { width: "100%" },
    to: { width: "0%" },
    config: { duration: removeAfterMs ?? undefined },
  });

  return (
    <Popup>
      <StyledClose onClick={removeThisPopup} />
      {popupContent}
      {removeAfterMs !== null ? <AnimatedFader style={faderStyle} /> : null}
    </Popup>
  );
}
