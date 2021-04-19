import React, { useCallback } from "react";

type PaginationProps = {
  currentPageNumber: number;
  totalPages: number;
  onSetPage(pageNumber: number): void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPageNumber,
  onSetPage,
  totalPages,
}) => {
  const onSetFirstPage = useCallback(() => onSetPage(1), [onSetPage]);
  const onSetLastPage = useCallback(() => onSetPage(totalPages), [
    totalPages,
    onSetPage,
  ]);
  const onSetNextPage = useCallback(() => onSetPage(currentPageNumber + 1), [
    currentPageNumber,
    onSetPage,
  ]);
  const onSetPrevPage = useCallback(() => onSetPage(currentPageNumber - 1), [
    currentPageNumber,
    onSetPage,
  ]);

  return (
    <ul className="pagination">
      <li>
        <button
          className={`nft__button ${currentPageNumber === 1 ? "disabled" : ""}`}
          onClick={onSetFirstPage}
        >
          {`<<`}
        </button>
      </li>
      <li>
        <button
          className={`nft__button ${currentPageNumber === 1 ? "disabled" : ""}`}
          onClick={onSetPrevPage}
        >
          {`<`}
        </button>
      </li>
      <li className="page-count">
        {currentPageNumber}/{totalPages}
      </li>
      <li>
        <button
          className={`nft__button ${
            currentPageNumber === totalPages ? "disabled" : ""
          }`}
          onClick={onSetNextPage}
        >
          {`>`}
        </button>
      </li>
      <li>
        <button
          className={`nft__button ${
            currentPageNumber === totalPages ? "disabled" : ""
          }`}
          onClick={onSetLastPage}
        >
          {`>>`}
        </button>
      </li>
    </ul>
  );
};

export default Pagination;
