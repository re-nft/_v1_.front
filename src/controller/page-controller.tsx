import React, { createContext } from "react";
import { Nft, Lending } from "../contexts/graph/classes";

/* eslint-disable-next-line */
type Props = {};
type State = {
  // todo: Renting probably too
  pageItems: (Nft | Lending)[];
  currentPage: (Nft | Lending)[];
  currentPageNumber: number;
  totalPages: number;
};

const defaultSate = {
  pageItems: [],
  currentPage: [],
  currentPageNumber: 1,
  totalPages: 1,
};

export type PageContextType = {
  currentPage: State["pageItems"];
  currentPageNumber: number;
  totalPages: number;
  onSetPage(pageNumber: number): void;
  onChangePage(items: State["pageItems"]): void;
  onResetPage(): void;
};

const defaultPageContext = {
  currentPage: [],
  currentPageNumber: 1,
  totalPages: 1,
  onSetPage: () => true,
  onChangePage: () => true,
  onResetPage: () => true,
};

export const PageContext = createContext<PageContextType>(defaultPageContext);

const PAGE_SIZE = 20;

class PageProvider extends React.Component<Props, State> {
  state: State = defaultSate;

  handleReset = (): void => this.setState(defaultSate);

  onChangePage = (pageItems: Nft[]): void => {
    const totalItems = pageItems.length || 0;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    this.setState({ pageItems, totalPages }, () => this.onSetPage(1));
  };

  onSetPage = (pageNumber: number): void => {
    const { totalPages, pageItems } = this.state;
    const items = pageItems.slice(0);

    if (pageNumber < 1 || pageNumber > totalPages) {
      return;
    }

    const currentPageNumber = pageNumber || 1;
    const totalItems = pageItems.length - 1 || 0;
    const startIndex = (pageNumber - 1) * PAGE_SIZE;
    const endIndex = Math.min(startIndex + PAGE_SIZE - 1, totalItems - 1);

    const currentPage = items.slice(startIndex, endIndex + 1);

    if (items.length < PAGE_SIZE - 1) {
      this.setState({ currentPageNumber, currentPage: items });
    } else {
      this.setState({ currentPageNumber, currentPage });
    }
  };

  componentWillUnmount(): void {
    this.handleReset();
  }

  render(): JSX.Element {
    const { currentPage, currentPageNumber, totalPages } = this.state;
    const contextValues: PageContextType = {
      currentPage,
      currentPageNumber,
      totalPages,
      onSetPage: this.onSetPage,
      onResetPage: this.handleReset,
      onChangePage: this.onChangePage,
    };

    return (
      <PageContext.Provider value={contextValues}>
        {this.props.children}
      </PageContext.Provider>
    );
  }
}

export default PageProvider;
