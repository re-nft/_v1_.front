import React, { Ref } from "react";
import ExclamationCircleIcon from "@heroicons/react/solid/ExclamationCircleIcon";
import type { ReactEventOnBlurType, ReactEventOnChangeType } from "renft-front/types";

export const TextField: React.FC<{
  required?: boolean;
  label: JSX.Element | string;
  value: string | ReadonlyArray<string> | number;
  onBlur: ReactEventOnBlurType;
  onChange: ReactEventOnChangeType;
  id?: string;
  name?: string;
  error?: boolean;
  helperText?: string | boolean | null;
  disabled?: boolean;
}> = React.forwardRef((props, ref) => {
  const {
    required,
    label,
    value,
    onChange,
    onBlur,
    id,
    name,
    error,
    helperText,
    disabled
  } = props;

  return (
    <div className="flex-1">
      <div
        className="font-body relative border-2 border-black  px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-rn-purple focus-within:border-rn-purple"
        ref={ref as Ref<HTMLDivElement>}
      >
        <label
          htmlFor={name}
          className="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white text-lg font-body text-gray-900"
        >
          {label}
        </label>
        <input
          className="block w-full border-0 px-3 mt-4 py-1 text-black placeholder-black focus:ring-2 focus:outline-none focus:ring-rn-purple sm:text-lg"
          disabled={disabled}
          required={required}
          id={id}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          name={name}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon
              className="h-5 w-5 text-rn-red"
              aria-hidden="true"
            />
          </div>
        )}

        {error && (
          <p className="mt-2 text-sm leading-tight text-rn-red text-right">
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
});

TextField.displayName = "TextField";
