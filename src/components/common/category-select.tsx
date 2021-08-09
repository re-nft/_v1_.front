import { TextField, withStyles } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React, { useCallback } from "react";
import { CategoryOptions } from '../../hooks/useSearch'

const style = {
  root: {
    color: "black",
    width: "15rem !important",
    fontFamily: "VT323",
    fontSize: "14px",
    textTransform: 'uppercase'
  },
  inputRoot: {
    border: "3px solid black",
    color: "black",
    paddingRight: "0",
    marginTop: "0 !important",
    height: "45px",
    fontFamily: "VT323",
    fontSize: "14px",
    paddingLeft: "10px",
    "&:after": {
        content: "none"
    },
    "&:before": {
        content: "none"
    }
  },
  input: {
    textTransform: 'uppercase',
  },
  paper: {
      marginTop: '20px',
      border: '3px solid black',
      borderRadius: 0,
      boxShadow: `7px 7px black,
        6px 6px 0 black,
        5px 5px 0 black,
        4px 4px 0 black,
        3px 3px 0 black,
        2px 2px 0 black,
        1px 1px 0 black;`
  },
  listbox: {
      padding: '0',
  },
  option: {
      textTransform: 'capitalize',
      "&:active, &:hover, &:focus, &[data-focus='true']": {
          backgroundColor: 'black',
          color: 'white'
      }
  }
};
//@ts-ignore
const StyledAutocomplete = withStyles(style)(Autocomplete);


export const CategorySelect: React.FC<{
  options: CategoryOptions[],
  setValue: (v:string) => void,
  defaultValue: CategoryOptions,
  value: CategoryOptions | undefined,
}> = ({
    options,
    setValue,
    defaultValue,
    value
}) => {
  const onChange = useCallback(
    (e_, value) => {
      if (!value) {
        setValue(defaultValue.name);
      } else {
        setValue(value.name);
      }
    },
    [options]
  );

  if (options.length < 1) return null;
  return (
    <StyledAutocomplete
      options={options}
      value={value || defaultValue}
      // @ts-ignore
      getOptionLabel={(option) => option.name}
      // @ts-ignore
      getOptionSelected={(option, value) => option.name == value.name}
      style={{ width: 300 }}
      onChange={onChange}
      renderInput={(params: any) => (
        <>
          <TextField {...params} />
        </>
      )}
      // @ts-ignore
      renderOption={(option: CategoryOptions) => (
        <>
          <span
            style={{
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              textTransform: 'uppercase'

            }}
          >
          {option.imageUrl && <img
              // @ts-ignore
              alt={option.description}
              // @ts-ignore
              src={option.imageUrl}
              width="20"
              height="20"
              style={{ marginRight: "5px" }}
            />
            }
            {/* @ts-ignore */}
            <span>{option.name}</span>
          </span>
        </>
      )}
    />
  );
};
