import { InputAdornment } from "@material-ui/core";
import React, { useCallback, useState } from "react";
import PaginationTextField from "./pagination-textfield";

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
  const [shadowPageNumber, setShadowPageNumber] = useState(currentPageNumber);
  const [error, setError] = useState("");
  const onSetFirstPage = useCallback(() => onSetPage(1), [onSetPage]);
  const onSetLastPage = useCallback(
    () => onSetPage(totalPages),
    [totalPages, onSetPage]
  );
  const onSetNextPage = useCallback(
    () => onSetPage(currentPageNumber + 1),
    [currentPageNumber, onSetPage]
  );
  const onSetPrevPage = useCallback(
    () => onSetPage(currentPageNumber - 1),
    [currentPageNumber, onSetPage]
  );
  const onChange = useCallback((e) => {
    const number = e.target.value;
    let debounce: NodeJS.Timeout | null;
    if (number < 1) {
      setError("Please choose a valid page number!");
    } else if (number > totalPages) {
      setError(`Please select a page number less then ${totalPages}!`);
    } else {
      setError("");
      debounce = setTimeout(()=>{
        onSetPage(number)
      }, 1000)
    }
    setShadowPageNumber(number);
    () => {
      if(debounce){
        clearTimeout(debounce)
      }
    }
  }, [totalPages]);
  return (
    <>
      <ul className="pagination">
        <li>
          <button
            className={`nft__button ${
              currentPageNumber === 1 ? "disabled" : ""
            }`}
            onClick={onSetFirstPage}
          >
            {`<<`}
          </button>
        </li>
        <li>
          <button
            className={`nft__button ${
              currentPageNumber === 1 ? "disabled" : ""
            }`}
            onClick={onSetPrevPage}
          >
            {`<`}
          </button>
        </li>
        <li className="page-count">
          <PaginationTextField
            id="standard-basic"
            label="Page number"
            type="number"
            size="small"
            onChange={onChange}
            value={shadowPageNumber}
            error={!!error}
            helperText={error}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">/{totalPages}</InputAdornment>
              ),
            }}
          />
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
    </>
  );
};

export default Pagination;
