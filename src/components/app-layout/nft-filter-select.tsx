import { TextField, withStyles } from "@material-ui/core";
import React, { useCallback } from "react";

import create from "zustand";
import shallow from "zustand/shallow";
import produce from "immer";
import { devtools } from "zustand/middleware";
import { Autocomplete } from "@material-ui/lab";
import { useSearchOptions } from "../../hooks/useSearch";

interface NftFilterState {
  filters: string | null;
  setFilters: (value: string | null) => void;
}

export const useNFTFilterBy = create<NftFilterState>(
  devtools((set, get) => ({
    filters: null,
    setFilters: (value) =>
      set(
        produce((state) => {
          state.filters = value;
        })
      )
  }))
);

const style = {
  root: {
    color: "black",
    width: "15rem !important",
    fontFamily: "VT323",
    fontSize: "14px"
  },
  inputRoot: {
    border: "3px solid black",
    color: "black",
    paddingRight: "0",
    marginTop: "0 !important",
    height: "45px",
    fontFamily: "VT323",
    fontSize: "14px",
    paddingLeft: "10px"
  }
};
const StyledAutocomplete = withStyles(style)(Autocomplete);

export const NftFilterSelect = () => {
  const setNftFilter = useNFTFilterBy((state) => state.setFilters, shallow);
  const options: { name: string }[] = useSearchOptions();
  const onChange = useCallback(
    (e_, value) => {
      if (!value) {
        setNftFilter(null);
      } else {
        setNftFilter(value.name);
      }
    },
    [options]
  );

  if (options.length < 1) return null;
  return (
    <StyledAutocomplete
      options={options}
      getOptionLabel={(option) => option.name}
      getOptionSelected={(option, value) => option.name == value.name}
      style={{ width: 300 }}
      onChange={onChange}
      renderInput={(params) => (
        <>
          <TextField {...params} />
        </>
      )}
      renderOption={(option) => (
        <>
          <span
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <img
              alt={option.description}
              src={option.imageUrl}
              width="20"
              height="20"
              style={{ marginRight: "5px" }}
            />
            <span>{option.name}</span>
          </span>
        </>
      )}
    />
  );
};
