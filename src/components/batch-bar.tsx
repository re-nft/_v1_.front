import React from "react";
import { Button } from "./common/button";

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
  <div className="fixed bottom-0 left-0 right-0 w-full mx-auto z-10 px-4 bg-rn-purple  border-t-8 border-black">
    <div className="flex content-between items-center p-6 ">
      <div className="font-display text-white flex-1 text-lg leading-loose">
        {title}
      </div>
      <div className="flex-1 justify-end flex flex-row">
        <Button onClick={onCancel} description="Cancel"></Button>
        <span style={{ width: "24px", display: "inline-flex" }} />
        <Button onClick={onClick} description={actionTitle}></Button>
      </div>
    </div>
  </div>
);

export default BatchBar;
