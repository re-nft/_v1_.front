import { InputAdornment } from "@material-ui/core";
import React, {
  useCallback,
  useState,
  useRef,
  useMemo,
  useEffect
} from "react";
import PaginationTextField from "./pagination-textfield";

type PaginationProps = {
  currentPageNumber: number;
  totalPages: number;
  onSetPage(pageNumber: number): void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPageNumber,
  onSetPage,
  totalPages
}) => {
  const [shadowPageNumber, setShadowPageNumber] = useState<number | "">(currentPageNumber);
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
  const ref = useRef<NodeJS.Timeout | null>();
  const onChange = useCallback(
    (e) => {
      const num = Number(e.target.value);
      if (ref.current) clearTimeout(ref.current);
      if(e.target.value === ""){
        setShadowPageNumber("");
        return
      }
      if (num != parseInt(e.target.value, 10)) {
        setError("Please choose a valid page number!");
        return;
      }
      if (num < 1) {
        setError("Please choose a valid page number!");
      } else if (num > totalPages) {
        setError(`Please select a page number less then ${totalPages}!`);
      } else {
        setError("");
        ref.current = setTimeout(() => {
          if (num !== currentPageNumber) {
            onSetPage(num);
          }
        }, 1000);
      }
      setShadowPageNumber(num);
      () => {
        if (ref.current) {
          clearTimeout(ref.current);
        }
      };
    },
    [currentPageNumber, onSetPage, totalPages]
  );
  const isFirstPage = useMemo(() => {
    return currentPageNumber === 1;
  }, [currentPageNumber]);
  const isLastpage = useMemo(() => {
    return currentPageNumber === totalPages;
  }, [currentPageNumber, totalPages]);

  useEffect(() => {
    setShadowPageNumber(currentPageNumber);
  }, [currentPageNumber]);

  // hide pagination if page number less than 2
  if (totalPages < 2) return null;

  return (
    <>
      <ul className="pagination">
        <li>
          <button
            className={`nft__button ${isFirstPage ? "disabled" : ""}`}
            onClick={onSetFirstPage}
          >
            {`<<`}
          </button>
        </li>
        <li>
          <button
            className={`nft__button ${isFirstPage ? "disabled" : ""}`}
            onClick={onSetPrevPage}
          >
            {`<`}
          </button>
        </li>
        <li className="page-count">
          <PaginationTextField
            id="standard-basic"
            label="Page number"
            type="string"
            size="small"
            onChange={onChange}
            value={shadowPageNumber}
            error={!!error}
            helperText={error}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">/{totalPages}</InputAdornment>
              )
            }}
          />
        </li>
        <li>
          <button
            className={`nft__button ${isLastpage ? "disabled" : ""}`}
            onClick={onSetNextPage}
          >
            {`>`}
          </button>
        </li>
        <li>
          <button
            className={`nft__button ${isLastpage ? "disabled" : ""}`}
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
