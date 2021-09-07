import { FormProps, LendInputProps } from "./lend-types";

export const validate = (values: FormProps) => {
  const errors: (Record<string, string | undefined> | undefined)[] = Array(
    values.inputs.length
  );
  values.inputs.forEach((input: LendInputProps, index: number) => {
    const error: Record<string, string | undefined> = {};
    validateLendAmount(input, error);
    validateMaxDuration(input, error);
    validateBorrowPrice(input, error);
    validateNftPrice(input, error);
    validatePaymentToken(input, error);
    errors[index] = Object.keys(error).length > 0 ? error : undefined;
  });
  const valid = errors.filter((e) => e !== undefined).length < 1;
  if (valid) return;
  return { inputs: errors };
};

const validateLendAmount = (
  input: LendInputProps,
  error: Record<string, string | undefined>
) => {
  const fieldName = "lendAmount";
  const field = input[fieldName];
  if (typeof field === "undefined") {
    error[fieldName] = "please specify amount";
  } else if (field < 1) {
    error[fieldName] = "amount must be greater than 1";
  } else if (field > Number(input.nft.amount)) {
    error[fieldName] =
      "amount must be less than equal then the total amount available";
  } else if (isInteger(field)) {
    error[fieldName] = "amount must be a whole number";
  } else if (!/^\d+(\.\d+)?$/i.test(field.toString())) {
    error[fieldName] = "amount must be a number";
  }
};

const validateMaxDuration = (
  input: LendInputProps,
  error: Record<string, string | undefined>
) => {
  const fieldName = "maxDuration";
  const field = input[fieldName];
  if (typeof field === "undefined") {
    error[fieldName] = "please specify lend duration";
  } else if (field < 1) {
    error[fieldName] = "lend duration must be greater than 1";
  } else if (field > 255) {
    error[fieldName] = "lend duration must be less or equal than 255";
  } else if (isInteger(field)) {
    error[fieldName] = "maxDuration must be a whole number";
  } else if (!/^\d+(\.\d+)?$/i.test(field.toString())) {
    error[fieldName] = "amount must be a number";
  }
};

const validateBorrowPrice = (
  input: LendInputProps,
  error: Record<string, string | undefined>
) => {
  const fieldName = "borrowPrice";
  const field = input[fieldName];
  if (typeof field === "undefined") {
    error[fieldName] = "please specify the borrow price";
  } else if (field < 0.0001) {
    error[fieldName] = "borrow price must be greater than or equal to 0.0001";
  } else if (field > 9999.9999) {
    error[fieldName] = "borrow price must be less then or equal 9999.9999";
  } else if (!is4Digits(field)) {
    error[fieldName] = "borrow price only accepts up to 4 fractional digits";
  } else if (!/^\d+(\.\d+)?$/i.test(field.toString())) {
    error[fieldName] = "amount must be a number";
  }
};

const validateNftPrice = (
  input: LendInputProps,
  error: Record<string, string | undefined>
) => {
  const fieldName = "nftPrice";
  const field = input[fieldName];
  if (typeof field === "undefined") {
    error[fieldName] = "please specify collateral";
  } else if (field < 0.0001) {
    error[fieldName] = "collateral must be greater than or equal to 0.0001";
  } else if (field > 9999.9999) {
    error[fieldName] = "collateral must be less then or equal 9999.9999";
  } else if (!is4Digits(field)) {
    error[fieldName] = "collateral only accepts up to 4 fractional digits";
  } else if (!/^\d+(\.\d+)?$/i.test(field.toString())) {
    error[fieldName] = "amount must be a number";
  }
};

const validatePaymentToken = (
  input: LendInputProps,
  error: Record<string, string | undefined>
) => {
  const fieldName = "pmToken";
  const field = input[fieldName];
  if (typeof field === "undefined") {
    error[fieldName] = "please specify payment token";
  } else if (field < 0 || field > 5) {
    error[fieldName] = "please specify payment token";
  }
};

const isInteger = (field: string | number): boolean => {
  try {
    return field != parseInt(field.toString(), 10);
  } catch (_) {
    return false;
  }
};

function is4Digits(x: number | string) {
  try {
    // precision up to 16 digits after
    const [_, b] = x.toString().split(".");
    if (!b) return true;
    const reminder = b.toString().slice(4);
    if (!reminder) return true;
    return reminder.replaceAll("0", "").length < 1;
  } catch (e) {
    return false;
  }
}
