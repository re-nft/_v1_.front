import { PaymentToken } from "@renft/sdk";
import { Listbox, Transition } from "@headlessui/react";
import { SelectorIcon } from "@heroicons/react/solid";
import { Fragment, useCallback } from "react";

const tokens = [
  { value: PaymentToken.WETH, name: "WETH", unavailable: false },
  { value: PaymentToken.DAI, name: "DAI", unavailable: false },
  { value: PaymentToken.USDC, name: "USDC", unavailable: false },
  { value: PaymentToken.USDT, name: "USDT", unavailable: false },
  { value: PaymentToken.TUSD, name: "TUSD", unavailable: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const TokenSelect: React.FC<{
  selectedValue: PaymentToken;
  handleChange: {
    (e: React.ChangeEvent<unknown>): void;
    <T = string | React.ChangeEvent<unknown>>(
      field: T
    ): T extends React.ChangeEvent<unknown>
      ? void
      : (e: string | React.ChangeEvent<unknown>) => void;
  };
  disabled?: boolean;
  refName?: string;
}> = ({ selectedValue, handleChange, disabled, refName }) => {
  const onChange = useCallback(
    (value) => {
      handleChange({
        target: {
          value,
          name: refName,
        },
      });
    },
    [handleChange, refName]
  );
  return (
    <Listbox value={selectedValue} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <>
          <Listbox.Label className="block text-base font-medium text-gray-700">
            Select a Payment Token
          </Listbox.Label>
          <div className="mt-1 relative">
            <Listbox.Button className="relative w-full bg-white border-2 border-black shadow-rn-one focus:shadow-rn-one-purple pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-rn-purple focus:border-rn-purple sm:text-md">
              <span className="block truncate">
                {tokens[selectedValue]?.name ||
                  "tokens > WETH/DAI/USDC/USDT/TUSD"}
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
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-20 mt-4 border-2 border-black w-full bg-white shadow-rn-one max-h-60 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-md">
                {tokens.map((token) => (
                  <Listbox.Option
                    key={token.name}
                    className={({ active }) =>
                      classNames(
                        active ? "text-white bg-black" : "text-black",
                        "cursor-default select-none relative"
                      )
                    }
                    value={token.value}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={classNames(
                            selected
                              ? "text-white bg-black"
                              : "text-black bg-white hover:text-white hover:bg-black",
                            "block truncate py-2 pl-4 pr-4"
                          )}
                        >
                          {token.name}
                        </span>

                        {/* {selected ? (
                            <span
                            className={classNames(
                            active ? 'text-white' : 'text-rn-green',
                            'absolute inset-y-0 left-0 flex items-center'
                            )}
                            >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            ) : null} */}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};
