import React, {
  createContext,
} from "react";

/* eslint-disable-next-line */
type Props = {};
type State<T> = {
  // todo: Renting probably too
  pageItems: T[];
  currentPage: T[];
  currentPageNumber: number;
  totalPages: number;
};

const defaultSate = {
  pageItems: [],
  currentPage: [],
  currentPageNumber: 1,
  totalPages: 1,
};

export type PageContextType<T> = {
  currentPage: T[];
  currentPageNumber: number;
  totalPages: number;
  onSetPage(pageNumber: number): void;
  onChangePage(items: T[]): void;
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

export const PageContext =
  createContext<PageContextType<any>>(defaultPageContext);

const PAGE_SIZE = 20;

class PageProvider<T> extends React.Component<Props, State<T>> {
  state: State<T> = defaultSate;

  handleReset = (): void => this.setState(defaultSate);

  onChangePage = (pageItems: T[]): void => {
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
    const contextValues: PageContextType<T> = {
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
