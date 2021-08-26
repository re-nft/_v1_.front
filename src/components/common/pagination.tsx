import React, {
  useCallback,
  useState,
  useRef,
  useMemo,
  useEffect,
} from "react";
import { ClientOnlyPortal } from "../client-only-portal";
import { Button } from "./button";

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
  const [shadowPageNumber, setShadowPageNumber] = useState<number | "">(
    currentPageNumber
  );
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
      if (e.target.value === "") {
        setShadowPageNumber("");
        return;
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
    <ClientOnlyPortal selector="#pagination">
      <div className="py-3 flex items-center justify-center space-x-2">
        <Button
          onClick={onSetFirstPage}
          description="<<"
          disabled={isFirstPage}
        ></Button>
        <Button
          onClick={onSetPrevPage}
          description="<"
          disabled={isFirstPage}
        ></Button>
        <div className="flex flex-col">
          <label
            htmlFor="pagenumber"
            sr-only="Page number"
            className="block text-sm font-medium text-gray-700"
          ></label>
          <div className="relative pr-2 py-4">
            <input
              type="string"
              name="pagenumber"
              onChange={onChange}
              value={shadowPageNumber}
              className="focus:ring-indigo-500 text-rn-purple bg-transparent border-transparent text-4xl w-8 text-right"
            />
            <span className="h-full bg-transparent text-rn-purple text-4xl">
              /{totalPages}
            </span>
          </div>
          <div>{error}</div>
        </div>
        <Button
          onClick={onSetNextPage}
          description=">"
          disabled={isLastpage}
        ></Button>
        <Button
          onClick={onSetLastPage}
          description=">>"
          disabled={isLastpage}
        ></Button>
      </div>
    </ClientOnlyPortal>
  );
};

export default Pagination;
