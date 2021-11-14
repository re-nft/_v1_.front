import React, { Fragment, useCallback, Ref } from "react";
import { Listbox, Transition } from "@headlessui/react";
import SelectorIcon from "@heroicons/react/solid/SelectorIcon";
import { PaymentToken } from "@renft/sdk";
import { classNames } from "renft-front/utils";
import type {
  ReactEventOnChangeType,
  ReactEventOnBlurType,
} from "renft-front/types";

import ExclamationCircleIcon from "@heroicons/react/solid/ExclamationCircleIcon";

const tokens = [
  { value: PaymentToken.WETH, name: "WETH", unavailable: false },
  { value: PaymentToken.DAI, name: "DAI", unavailable: false },
  { value: PaymentToken.USDC, name: "USDC", unavailable: false },
  { value: PaymentToken.USDT, name: "USDT", unavailable: false },
  { value: PaymentToken.TUSD, name: "TUSD", unavailable: false },
];

export const TokenSelect: React.FC<{
  selectedValue: PaymentToken;
  onChange: ReactEventOnChangeType;
  onBlur: ReactEventOnBlurType;
  disabled?: boolean;
  name: string;
  error?: string;
  helperText?: string;
  id?: string;
}> = React.forwardRef(
  (
    {
      selectedValue,
      onChange: handleChange,
      onBlur,
      disabled,
      name,
      error,
      helperText,
      id,
    },
    ref
  ) => {
    const onChange = useCallback(
      (value) => {
        handleChange({
          target: {
            value,
            name,
          },
        });
      },
      [handleChange, name]
    );
    return (
      <div className="pb-4" ref={ref as Ref<HTMLDivElement>}>
        <Listbox
          as="div"
          id={id}
          aria-invalid={!!error}
          aria-errormessage={`${id || name}-error`}
          value={selectedValue}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
        >
          {({ open }) => {
            return (
              <>
                <div className="mt-1 relative">
                  <Listbox.Label className="sr-only">
                    Payment token
                  </Listbox.Label>
                  <Listbox.Button className="relative w-full bg-white border-2 border-black shadow-rn-one focus:shadow-rn-one-purple pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-rn-purple focus:border-rn-purple sm:text-md">
                    <span className="block truncate">
                      {tokens[selectedValue - 1]?.name ||
                        "Select a Payment Token > WETH/DAI/USDC/USDT/TUSD"}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <SelectorIcon
                        className="h-5 w-5 text-black"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>

                  <Transition
                    show={open}
                    as={Fragment}
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                  >
                    <Listbox.Options className="absolute z-20 mt-4 border-2 border-black w-full bg-white shadow-rn-one max-h-60 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-md">
                      {tokens.map((token) => (
                        <Listbox.Option
                          key={token.name}
                          className={({ active, selected }) =>
                            classNames(
                              active || selected
                                ? "text-white bg-black"
                                : "text-black",
                              "cursor-default select-none relative"
                            )
                          }
                          value={token.value}
                        >
                          {() => {
                            return (
                              <>
                                <span
                                  className={classNames(
                                    "block truncate py-2 pl-4 pr-4"
                                  )}
                                >
                                  {token.name}
                                </span>
                              </>
                            );
                          }}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
            );
          }}
        </Listbox>
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon
              className="h-5 w-5 text-rn-red"
              aria-hidden="true"
            />
          </div>
        )}

        {error && (
          <p
            className="mt-2 text-sm leading-tight text-rn-red text-right"
            data-testid="error"
            id={`${id || name}-error`}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TokenSelect.displayName = "TokenSelect";
