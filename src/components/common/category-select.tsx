import React, { useCallback, useEffect, useState } from "react";
import { CategoryOptions } from "../../hooks/useSearch";
//@ts-ignore
import Select, { components } from "react-select";

const customStyles = {
  option: (provided: any, state: any) => ({
    ...provided,
    color: state.isSelected || state.isFocused ? "white" : "black",
    backgroundColor: state.isSelected || state.isFocused ? "black" : "white",
  }),
  placeholder: (provided: any, state: any) => ({
    ...provided,
    display: state.isFocused ? "none" : "block",
    color: "black",
  }),
  control: (provided: any, state: any) => ({
    // none of react-select's styles are passed to <Control />
    ...provided,
    zIndex: 100,
    color: "black",
    width: "13rem",
    fontFamily: "VT323",
    fontSize: "14px",
    lineHeight: "19px",
    textTransform: "uppercase",
    borderRadius: 0,
    border: "3px solid black",
    boxShadow: `7px 7px black`,
    "&:hover": {
      borderColor: state.isFocused ? "#6a3a95" : "black",
    },
  }),
  menu: (provided: any) => ({
    // none of react-select's styles are passed to <Control />
    ...provided,
    color: "black",
    zIndex: 100,
    borderRadius: 0,
    marginTop: "20px",
    border: "3px solid black",
    boxShadow: `7px 7px black`,
  }),
  menuList: (provided: any) => ({
    ...provided,
    paddingTop: 0,
    paddingBottom: 0,
  }),
  singleValue: (provided: any, state: any) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = "opacity 300ms";

    return { ...provided, opacity, transition, textTransform: "uppercase" };
  },
  input: (provided: any, state: any) => ({
    ...provided,
    color: "black",
    borderColor: state.isFocused ? "purple" : "black",
    textTransform: "uppercase",
    opacity: 1,
  }),
};

const Control: React.FC<unknown> = ({ children, ...rest }) => {
  //@ts-ignore
  const imageUrl = rest.selectProps?.imageUrl;
  return (
    // @ts-ignore
    <components.Control {...rest}>
      {imageUrl && (
        <img
          src={imageUrl}
          style={{ marginLeft: "10px", height: "20px", width: "20px" }}
        />
      )}
      {children}
    </components.Control>
  );
};

const Option: React.FC<unknown> = ({ children, ...rest }) => {
  //@ts-ignore
  const imageUrl = rest.data?.imageUrl;
  return (
    // @ts-ignore
    <components.Option {...rest}>
      {imageUrl && (
        <img
          src={imageUrl}
          style={{ marginRight: "10px", height: "20px", width: "20px" }}
        />
      )}
      {children}
    </components.Option>
  );
};

export const CategorySelect: React.FC<{
  options: CategoryOptions[];
  setValue: (v: string) => void;
  defaultValue: CategoryOptions;
  value: CategoryOptions | undefined;
  instanceId: string;
}> = ({ options, setValue, defaultValue, value, instanceId }) => {
  const onChange = useCallback(
    (option) => {
      const value = option?.value || defaultValue.label;
      setValue(value);
    },
    [options, setValue]
  );

  return (
    //@ts-ignore
    <Select
      isClearable
      isSearchable={false}
      placeholder={defaultValue.label}
      options={options}
      //@ts-ignore
      imageUrl={value?.imageUrl}
      value={value}
      // NOTE 1: force stupid instanceid to rerender a new component, as state is kept around
      // NOTE 2: set instanceId for server side as well
      instanceId={instanceId}
      styles={customStyles}
      onChange={onChange}
      components={{
        Control,
        Option,
      }}
    />
  );
};
