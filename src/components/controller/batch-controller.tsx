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
    onCheckboxChange(evt: React.ChangeEvent<HTMLInputElement>): void;
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
        console.log(' handleReset ');
        this.setState({
            checkedMap: {},
            checkedItems: []
        });
    };

    handleSetCheckedItem = (item: Nft) => {
        console.log(' handleSetCheckedItem ', item);
        this.setState({ checkedItems: [item] });
    };

    handleSetItems = (items: Nft[]) => {
        console.log(' handleSetItems ', items);
        this.setState({ items });
    };

    handleCheckboxChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const {checkedItems, checkedMap, items} = this.state;

        const target = evt.target.name;
        const checked = evt.target.checked;
        const sources = checkedItems.slice(0);
        const item = items.find((nft) => nft.tokenId === target);
        const sourceIndex = checkedItems.findIndex((nft) => nft.tokenId === target);
        
        this.setState({
            checkedMap: {
                ...checkedMap,
                [target]: checked,
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

    // componentDidMount () {
        
    // }

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