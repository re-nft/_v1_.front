import React, { createContext } from "react";
import { Nft } from "../../contexts/graph/classes";

  /* eslint-disable-next-line */  
  type Props = {};
  type State = {
    pageItems: Nft[];
    currentPage: Nft[];
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
    currentPage: Nft[];
    currentPageNumber: number; 
    totalPages: number;
    onSetPage(pageNumber: number): void;
    onChangePage(items: Nft[]): void;
  };

  const defaultPageContext = {
    currentPage: [],
    currentPageNumber: 1,
    totalPages: 1,
    // Avoid @typescript-eslint/no-empty-function
    onSetPage: () => true,
    onChangePage: () => true,
  };

export const PageContext = createContext<PageContextType>(defaultPageContext);

const PAGE_SIZE = 20;

class PageProvider extends React.Component<Props, State> {
    state: State = defaultSate;

    handleReset = () => this.setState(defaultSate);

    onChangePage = (pageItems: Nft[]) => {
        const totalItems = pageItems.length -1 || 0;
        const totalPages = Math.ceil(totalItems / PAGE_SIZE);
        this.setState({pageItems, totalPages}, () => this.onSetPage(1));
    };

    onSetPage = (pageNumber: number) => {
        const {totalPages, pageItems} = this.state;
        const items = pageItems.slice(0);
        
        if (pageNumber < 1 || pageNumber > totalPages) {
            return;
        }

        const currentPageNumber = pageNumber || 1;
        const totalItems = pageItems.length -1 || 0;
        const startIndex = (pageNumber - 1) * PAGE_SIZE;
        const endIndex = Math.min(startIndex + PAGE_SIZE - 1, totalItems - 1); 

        const currentPage = items.slice(startIndex, endIndex + 1);

        this.setState({
            currentPageNumber,
            currentPage
        });
    };

    componentWillUnmount () {
        this.handleReset();
    }

    render () {
        const {currentPage, currentPageNumber, totalPages} = this.state;
        const contextValues: PageContextType = {
            currentPage,
            currentPageNumber,
            totalPages,
            onSetPage: this.onSetPage,
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