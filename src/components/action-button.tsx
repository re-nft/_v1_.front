import React from "react";

type ActionButtonProps<T> = {
  nft: T;
  title: string;
  onClick: (nft: T) => void;
  disabled?: boolean;
};

/* eslint-disable-next-line */
const ActionButton = <T extends {}>(props: ActionButtonProps<T>) => {
  const onClickHandler = (): void => props.onClick(props.nft);

  return (
    <div className="nft__control">
      <button
        className={`nft__button ${props.disabled ? "disabled" : ""}`}
        onClick={onClickHandler}
        disabled={props.disabled}
        type="button"
      >
        {props.title}
      </button>
    </div>
  );
};

export default ActionButton;
