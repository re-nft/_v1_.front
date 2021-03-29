import React, {useCallback} from "react";

type PaginationProps = {
    currentPageNumber: number; 
    totalPages: number;
    onSetPage(pageNumber: number): void;
};

const Pagination: React.FC<PaginationProps> = ({ currentPageNumber, onSetPage, totalPages }) => {
  const onSetFirstPage = useCallback(() => onSetPage(1), []);
  const onSetLastPage = useCallback(() => onSetPage(totalPages), [totalPages]);
  const onSetNextPage = useCallback(() => onSetPage(currentPageNumber + 1), [currentPageNumber]);
  const onSetPrevPage = useCallback(() => onSetPage(currentPageNumber - 1), [currentPageNumber]);

  return (
    <ul className="pagination">
        <li>
            <button className={`nft__button ${currentPageNumber === 1 ? 'disabled' : ''}`} onClick={onSetFirstPage}>
                {`<<`}
            </button>
        </li>
        <li>
            <button className={`nft__button ${currentPageNumber === 1 ? 'disabled' : ''}`} onClick={onSetPrevPage}>
                {`<`}
            </button>
        </li>
        <li className="page-count">
            {currentPageNumber}/{totalPages}
        </li>
        <li>
            <button className={`nft__button ${currentPageNumber === totalPages ? 'disabled' : ''}`} onClick={onSetNextPage}>
                {`>`}
            </button>
        </li>
        <li>
            <button className={`nft__button ${currentPageNumber === totalPages ? 'disabled' : ''}`} onClick={onSetLastPage}>
                {`>>`}
            </button>
        </li>
    </ul>
  );
};

export default Pagination;
