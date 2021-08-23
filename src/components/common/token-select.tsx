import { Listbox } from "@headlessui/react";
import { PaymentToken } from "@renft/sdk";

const tokens = [
  { value: PaymentToken.WETH, name: "WETH", unavailable: false },
  { value: PaymentToken.DAI, name: "DAI", unavailable: false },
  { value: PaymentToken.USDC, name: "USDC", unavailable: false },
  { value: PaymentToken.USDT, name: "USDT", unavailable: false },
  { value: PaymentToken.TUSD, name: "TUSD", unavailable: false },
];

{
  /* <option value={PaymentToken.WETH}>WETH</option>
<option value={PaymentToken.DAI}>DAI</option>
<option value={PaymentToken.USDC}>USDC</option>
<option value={PaymentToken.USDT}>USDT</option>
<option value={PaymentToken.TUSD}>TUSD</option> */
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
  return (
    <Listbox
      value={selectedValue}
      onChange={handleChange}
      disabled={disabled}
      refName={refName}
    >
      <Listbox.Label>Select Payment Token *</Listbox.Label>
      <Listbox.Button>{selectedValue}</Listbox.Button>
      <Listbox.Options>
        {tokens.map((token) => (
          <Listbox.Option
            key={token.value}
            value={token.value}
            disabled={token.unavailable}
          >
            {token.name}
          </Listbox.Option>
        ))}
      </Listbox.Options>
    </Listbox>
  );
};
