const fancyStyle = {
  root: {
    margin: "10px 0",
    "& label": {
      color: "#000",
      background: "#eee6f6",
      paddingRight: "12px",
    },
    "& input": {
      color: "#000",
      fontWeight: "400",
      padding: "15px 12px",
    },
    "& label.Mui-focused": {
      color: "#000",
      background: "#eee6f6",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "black",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "black",
        border: "2px solid black",
      },
      "&:hover fieldset": {
        borderColor: "black",
      },
      "&.Mui-focused fieldset": {
        borderColor: "black",
      },
    },
  },
};

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
}> = (props) => {
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
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        type="textfield"
        disabled={disabled}
        required={required}
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        name={name}
      ></input>
      {error && <span>{helperText}</span>}
    </div>
  );
};
