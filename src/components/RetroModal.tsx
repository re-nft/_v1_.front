import React from "react";
import { Modal } from "@material-ui/core";

import RainbowButton from "./RainbowButton";

type RetroModalProps = {
  handleSubmit: (e: React.FormEvent) => void;
  title: string;
  buttonTitle: string;
  open: boolean;
  handleClose: () => void;
};

const RetroModal: React.FC<RetroModalProps> = ({
  children,
  handleSubmit,
  title,
  buttonTitle,
  open,
  handleClose,
}) => {
  return (
    <Modal
      open={open}
      disableEnforceFocus
      disableAutoFocus
      onClose={handleClose}
    >
      <div className="feedback-card">
        <div className="feedback-header">{title}</div>
        <form className="feedback-body" onSubmit={handleSubmit}>
          {children}
          {/* <input
            type="email"
            className="feedback-body__email"
            placeholder="Email"
          />
          <textarea
            className="feedback-body__message"
            placeholder="Message"
          ></textarea> */}
          <RainbowButton text={buttonTitle} />
          {/* <button className="feedback-body__submit">{buttonTitle}</button> */}
        </form>
      </div>
    </Modal>
  );
};

export default RetroModal;
