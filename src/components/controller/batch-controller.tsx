import React, { createContext } from "react";
import { Nft } from "../../contexts/graph/classes";

  /* eslint-disable-next-line */  
  type Props = {};
  type State = {
    checkedItems: Nft[];
    checkedMap: Record<string, boolean>;
    items: Nft[];
  };

  export type BatchContextType = {
    checkedItems: Nft[],
    checkedMap: Record<string, boolean>;
    countOfCheckedItems: number;
    onReset(): void
    onSetItems(items: Nft[]): void;
    onCheckboxChange(name: string, checked: boolean): void;
    onSetCheckedItem(items: Nft): void;
  };

  const defaultBatchContext = {
    checkedItems: [],
    checkedMap: {},
    countOfCheckedItems: 0,
    // Avoid @typescript-eslint/no-empty-function
    onReset: () => true,
    onSetItems: () => true,
    onCheckboxChange: () => true,
    onSetCheckedItem: () => true,
  };

export const BatchContext = createContext<BatchContextType>(defaultBatchContext);


class BatchProvider extends React.Component<Props, State> {
    state: State = {
        checkedItems: [],
        checkedMap: {},
        items: [],
    };

    handleReset = () => {
        this.setState({
            checkedMap: {},
            checkedItems: []
        });
    };

    handleSetCheckedItem = (item: Nft) => {
        this.setState({ checkedItems: [item] });
    };

    handleSetItems = (items: Nft[]) => {
        this.setState({ items });
    };

    handleCheckboxChange = (name: string, checked: boolean) => {
        const {checkedItems, checkedMap, items} = this.state;

        const [address, tokenId] = name.split('::');
        const sources = checkedItems.slice(0);
        const item = items.find((nft) => nft.address === address && nft.tokenId === tokenId);
        const sourceIndex = checkedItems.findIndex((nft) => nft.address === address && nft.tokenId === tokenId);
        
        this.setState({
            checkedMap: {
                ...checkedMap,
                [tokenId]: checked,
            }
        })

        if (sourceIndex === -1 && item) {
            sources.push(item);
            this.setState({ checkedItems: sources });
        } else {
            sources.splice(sourceIndex, 1);
            this.setState({ checkedItems: sources });
        }
    };

    componentWillUnmount () {
        // When component will unmount we should reset controller state
        this.handleReset();
    }

    render () {
        const { checkedItems, checkedMap } = this.state;
        const contextValues: BatchContextType = {
            checkedItems,
            checkedMap,
            countOfCheckedItems: checkedItems.length,
            onReset: this.handleReset,
            onSetItems: this.handleSetItems,
            onCheckboxChange: this.handleCheckboxChange,
            onSetCheckedItem: this.handleSetCheckedItem,
        };

        return (
            <BatchContext.Provider value={contextValues}>
                {this.props.children}
            </BatchContext.Provider>
        );
    }
}

export default BatchProvider;