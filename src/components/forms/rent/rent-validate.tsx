import { LendingWithKey } from "./rent-types";

export const validate = (values: { inputs: LendingWithKey[] }) => {
  const errors: (Record<string, string | undefined> | undefined)[] = Array(
    values.inputs.length
  );
  values.inputs.forEach((input: LendingWithKey, index: number) => {
    const error: Record<string, string | undefined> = {};
    if (typeof input.duration === "undefined") {
      error.duration = "please specify duration";
    } else if (input.duration > input.lending.maxRentDuration) {
      error.duration =
        "the duration cannot be greater then the max rent duration";
    } else if (input.duration != parseInt(input.duration.toString(), 10)) {
      error.duration = "maxDuration must be a whole number";
    } else if (!/^\d+(\.\d+)?$/i.test(input.duration.toString())) {
      error.duration = "amount must be a number";
    }
    errors[index] = Object.keys(error).length > 0 ? error : undefined;
  });
  const valid = errors.filter((e) => e !== undefined).length < 1;
  if (valid) return;
  return { inputs: errors };
};
