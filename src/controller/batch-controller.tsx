import React, { createContext } from "react";

import { Nft, Lending, isLending } from "../contexts/graph/classes";
import { RENFT_SUBGRAPH_ID_SEPARATOR } from "../consts";

/* eslint-disable-next-line */
type Props = {};
type State = {
  checkedItems: Nft[];
  checkedMap: Record<string, boolean>;
  items: Nft[];
};

export type BatchContextType = {
  checkedItems: Nft[];
  // this is a typeguard of the above
  checkedLendingItems: Lending[];
  checkedMap: Record<string, boolean>;
  countOfCheckedItems: number;
  onReset(): void;
  onSetItems(items: Nft[]): void;
  onCheckboxChange(name: string, checked: boolean): void;
  onSetCheckedItem(items: Nft): void;
};

const defaultBatchContext = {
  checkedItems: [],
  checkedLendingItems: [],
  checkedMap: {},
  countOfCheckedItems: 0,
  // Avoid @typescript-eslint/no-empty-function
  onReset: () => true,
  onSetItems: () => true,
  onCheckboxChange: () => true,
  onSetCheckedItem: () => true,
};

export const BatchContext =
  createContext<BatchContextType>(defaultBatchContext);

class BatchProvider extends React.Component<Props, State> {
  state: State = {
    checkedItems: [],
    checkedMap: {},
    items: [],
  };

  handleReset = (): void => {
    this.setState({
      checkedMap: {},
      checkedItems: [],
    });
  };

  handleSetCheckedItem = (item: Nft): void => {
    this.setState({ checkedItems: [item] });
  };

  handleSetItems = (items: Nft[]): void => {
    this.setState({ items });
  };

  handleCheckboxChange = (name: string, checked: boolean): void => {
    const { checkedItems, checkedMap, items } = this.state;

    const [address, tokenId] = name.split(RENFT_SUBGRAPH_ID_SEPARATOR);
    const sources = checkedItems.slice(0);
    const item = items.find(
      (nft) => nft.address === address && nft.tokenId === tokenId
    );
    const sourceIndex = checkedItems.findIndex(
      (nft) => nft.address === address && nft.tokenId === tokenId
    );

    this.setState({
      checkedMap: {
        ...checkedMap,
        [tokenId]: checked,
      },
    });

    // ? how about when item is undefined and sourceIndex === -1?
    if (sourceIndex === -1 && item) {
      sources.push(item);
      this.setState({ checkedItems: sources });
    } else {
      sources.splice(sourceIndex, 1);
      this.setState({ checkedItems: sources });
    }
  };

  checkedLendingItems = (): Lending[] => {
    const _checkedLendingItems: Lending[] = [];

    // ? is this the correct way to pull from the state
    for (const _checkedItem of this.state.checkedItems) {
      if (isLending(_checkedItem)) {
        _checkedLendingItems.push(_checkedItem);
      }
    }

    return _checkedLendingItems;
  };

  componentWillUnmount(): void {
    // When component will unmount we should reset controller state
    this.handleReset();
  }

  render(): JSX.Element {
    const { checkedItems, checkedMap } = this.state;
    const contextValues: BatchContextType = {
      checkedItems,
      checkedLendingItems: this.checkedLendingItems(),
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
