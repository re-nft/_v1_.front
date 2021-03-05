import React from "react";

type BatchBarProps = {
    title: string; 
    actionTitle: string;
    onClick(): void;
};

const BatchBar: React.FC<BatchBarProps> = ({title, actionTitle, onClick}) => (
    <div className="batch">
        <div className="batch__inner">
            <div className="column" style={{ flexGrow: 1 }}>{title}</div>
            <div className="column">
                <span className="Nft__button" onClick={onClick}>
                    {actionTitle}
                </span>
            </div>
        </div>
    </div>
);

export default BatchBar;