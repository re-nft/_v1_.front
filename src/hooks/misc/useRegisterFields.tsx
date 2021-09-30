import { useCallback, useMemo } from "react";
import { FormState, UseFormRegister } from "react-hook-form/dist/types";

interface Inputs<V extends Record<string, unknown>> {
  inputs: V[];
}
//TODO fix ts-ignore
export const useRegisterFields = <V extends Record<string, unknown>>(
  register: UseFormRegister<Inputs<V>>,
  formState: FormState<Inputs<V>>,
  index: number
) => {
  const touchedInput = useMemo(() => {
    const touchedInputs = formState.touchedFields.inputs;
    return touchedInputs ? touchedInputs[index] : undefined;
  }, [formState.touchedFields.inputs]);
  const errorInput = useMemo(() => {
    const errorInputs = formState.errors.inputs;
    return errorInputs ? errorInputs[index] : undefined;
  }, [formState.errors.inputs]);

  return useCallback(
    (fieldName: keyof V) => {
      const hasError =
        touchedInput &&
        //@ts-ignore
        touchedInput[fieldName] &&
        errorInput &&
        //@ts-ignore
        typeof errorInput[fieldName] === "object";
      const message =
      //@ts-ignore
        errorInput && errorInput[fieldName]
          ? //@ts-ignore

            errorInput[fieldName]?.message
          : null;
      return {
        error: hasError,
        helperText: hasError ? message : false,
        //@ts-ignore
        ...register(`inputs.${index}.${fieldName}`)
      };
    },
    [touchedInput, errorInput]
  );
};
