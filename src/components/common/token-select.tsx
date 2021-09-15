import { PaymentToken } from "@renft/sdk";
import { Listbox, Transition } from "@headlessui/react";
import SelectorIcon from "@heroicons/react/solid/SelectorIcon";
import { Fragment, useCallback, forwardRef, Ref } from "react";
import { classNames } from "../../utils";
import { ReactEventOnChangeType } from "../../types";

const tokens = [
  { value: PaymentToken.WETH, name: "WETH", unavailable: false },
  { value: PaymentToken.DAI, name: "DAI", unavailable: false },
  { value: PaymentToken.USDC, name: "USDC", unavailable: false },
  { value: PaymentToken.USDT, name: "USDT", unavailable: false },
  { value: PaymentToken.TUSD, name: "TUSD", unavailable: false }
];

export const TokenSelect: React.FC<{
  selectedValue: PaymentToken;
  onChange: ReactEventOnChangeType;
  disabled?: boolean;
  name: string;
}> = forwardRef(({ selectedValue, onChange: handleChange, disabled, name }, ref) => {
  const onChange = useCallback(
    (value) => {
      console.log(value);
      handleChange({
        target: {
          value,
          name
        }
      });
    },
    [handleChange]
  );
  return (
    <div className="pb-4">
      <Listbox
        as="div"
        value={selectedValue}
        onChange={onChange}
        disabled={disabled}
        ref={ref as Ref<HTMLDivElement>}
      >
        {({ open }) => (
          <>
            <div className="mt-1 relative">
              <Listbox.Button className="relative w-full bg-white border-2 border-black shadow-rn-one focus:shadow-rn-one-purple pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-rn-purple focus:border-rn-purple sm:text-md">
                <span className="block truncate">
                  {tokens[selectedValue]?.name ||
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
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
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
                      {({ selected, active }) => {
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
        )}
      </Listbox>
    </div>
  );
});
