import React from "react";

type BatchBarProps = {
    title: string; 
    actionTitle: string;
    onClick(): void;
    onCancel(): void;
};

const BatchBar: React.FC<BatchBarProps> = ({title, actionTitle, onClick, onCancel}) => (
    <div className="batch">
        <div className="batch__inner">
            <div className="column" style={{ flexGrow: 1 }}>{title}</div>
            <div className="column">
                <span className="Nft__button" onClick={onCancel}>
                    Cancel
                </span>
                <span style={{ width: '24px', display: 'inline-flex' }}/>
                <span className="Nft__button" onClick={onClick}>
                    {actionTitle}
                </span>
            </div>
        </div>
    </div>
);

export default BatchBar;