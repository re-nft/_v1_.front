import React from "react";

type ActionButtonProps<T> = {
  nft: T;
  title: string;
  onClick: (nft: T) => void;
};

class ActionButton<T> extends React.Component<ActionButtonProps<T>> {
  onClickHandler = (): void => this.props.onClick(this.props.nft);

  render(): JSX.Element {
    return (
      <div className="nft__control">
        <button className="nft__button" onClick={this.onClickHandler}>
          {this.props.title}
        </button>
      </div>
    );
  }
}

export default ActionButton;
