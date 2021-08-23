import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react/solid";

export const TextField: React.FC<{
  required?: boolean;
  label: JSX.Element | string;
  value: string | ReadonlyArray<string> | number;
  onBlur: {
    (e: React.FocusEvent<unknown>): void;
    <T = unknown>(fieldOrEvent: T): T extends string
      ? (e: unknown) => void
      : void;
  };
  onChange: {
    (e: React.ChangeEvent<unknown>): void;
    <T = string | React.ChangeEvent<unknown>>(
      field: T
    ): T extends React.ChangeEvent<unknown>
      ? void
      : (e: string | React.ChangeEvent<unknown>) => void;
  };
  id?: string;
  name?: string;
  error?: boolean;
  helperText?: string | false | null;
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
    disabled,
  } = props;

  return (
    <div
      className="font-body relative border-2 border-black  px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-rn-purple-dark focus-within:border-rn-purple-dark"
      ref={ref}
    >
      <label
        htmlFor={name}
        className="absolute -top-2 left-2 -mt-px inline-block px-1 bg-white text-lg font-body text-gray-900"
      >
        {label}
      </label>
      <input
        className="block w-full border-0 p-0 text-black placeholder-black focus:ring-0 sm:text-lg"
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

      {error && <p className="mt-2 text-sm text-rn-red">{helperText}</p>}
    </div>
  );
});

TextField.displayName = "TextField";
