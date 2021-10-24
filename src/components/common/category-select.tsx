import { Fragment, useCallback } from "react";
import { Listbox, Transition } from "@headlessui/react";
import SelectorIcon from "@heroicons/react/solid/SelectorIcon";

import { CategoryOptions } from "renft-front/hooks/store/useSearch";
import { classNames } from "renft-front/utils";

export const CategorySelect: React.FC<{
  options: CategoryOptions[];
  setValue: (v: string) => void;
  defaultValue: CategoryOptions;
  value: CategoryOptions | undefined;
  disabled?: boolean;
  label: string;
}> = ({ options, setValue, value, defaultValue, disabled, label }) => {
  const onChange = useCallback(
    (value: string) => {
      setValue(value);
    },
    [setValue]
  );

  return (
    <Listbox
      value={value || defaultValue}
      //@ts-ignore
      onChange={onChange}
      disabled={disabled}
    >
      {({ open }) => (
        <>
          <div className="relative w-48 font-body">
            <Listbox.Label className="sr-only">{label}</Listbox.Label>
            <Listbox.Button className="relative w-full bg-white border-2 flex border-black shadow-rn-one focus:shadow-rn-one-purple pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-rn-purple focus:border-rn-purple sm:text-md">
              {value?.imageUrl && (
                <span className="flex-1 justify-center items-center pr-2">
                  <img src={value.imageUrl} className="h-5 w-5"></img>
                </span>
              )}

              <span className="block truncate text-left flex-auto">
                {value?.label || defaultValue.label}
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
                {options.length < 1 && (
                  <div className="p-2 cursor-not-allowed">No options</div>
                )}
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      classNames(
                        active ? "text-white bg-black" : "text-black",
                        "cursor-default select-none relative flex justify-center items-center"
                      )
                    }
                    value={option.value}
                  >
                    {({ selected, active }) => (
                      <>
                        {option.imageUrl && (
                          <span className="flex-1 justify-center items-center">
                            <img
                              src={option.imageUrl}
                              className="h-4 w-4 ml-2"
                            ></img>
                          </span>
                        )}
                        <span
                          className={classNames(
                            selected || active
                              ? "text-white bg-black"
                              : "text-black bg-white hover:text-white hover:bg-black",
                            "block truncate py-2 pl-4 pr-4 flex-auto text-left"
                          )}
                        >
                          {option.label}
                        </span>
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
