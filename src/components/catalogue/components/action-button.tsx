import React from "react";

type ActionButtonProps<T> = {
  nft: T;
  title: string;
  onClick: (nft: T) => void;
};

class ActionButton<T extends any> extends React.Component<ActionButtonProps<T>> {
  onClickHandler = () => this.props.onClick(this.props.nft);

  render() {
    const {title} = this.props;
    return (
      <div className="nft__control">
        <button className="nft__button" onClick={this.onClickHandler}>
          {title}
        </button>
      </div>
    );
  }
}

export default ActionButton;
