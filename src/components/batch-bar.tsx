import React from "react";

type BatchBarProps = {
  title: string;
  actionTitle: string;
  onClick(): void;
  onCancel(): void;
};

const BatchBar: React.FC<BatchBarProps> = ({
  title,
  actionTitle,
  onClick,
  onCancel,
}) => (
  <div className="batch">
    <div className="batch__inner">
      <div
        className="column"
        style={{ flexGrow: 1, fontSize: "20px", color: "#fff" }}
      >
        {title}
      </div>
      <div className="column">
        <button className="nft__button red" onClick={onCancel}>
          Cancel
        </button>
        <span style={{ width: "24px", display: "inline-flex" }} />
        <button className="nft__button" onClick={onClick}>
          {actionTitle}
        </button>
      </div>
    </div>
  </div>
);

export default BatchBar;
