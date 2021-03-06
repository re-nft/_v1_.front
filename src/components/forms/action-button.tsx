import React, { useCallback } from "react";
import { Nft } from "../../contexts/graph/classes";

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
      <div className="Nft__card" style={{ marginTop: "8px" }}>
        <div className="Nft__card">
          <span className="Nft__button" onClick={this.onClickHandler}>
            {title}
          </span>
        </div>
      </div>
    );
  }
}

export default ActionButton;
