import { useCallback, useMemo } from "react";
import { FormState, UseFormRegister } from "react-hook-form/dist/types";
import { FormProps, LendInputProps } from "../components/forms/lend/lend-types";

export const useRegisterFields = (
    register: UseFormRegister<FormProps>,
    formState: FormState<FormProps>,
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
      (fieldName: keyof LendInputProps) => {
        const hasError =
          touchedInput &&
          touchedInput[fieldName] &&
          errorInput &&
          typeof errorInput[fieldName] === "object";
        const message =
          errorInput && errorInput[fieldName]
            ? //@ts-ignore
  
              errorInput[fieldName]?.message
            : null;
        return {
          error: hasError,
          helperText: hasError ? message : false,
          ...register(`inputs.${index}.${fieldName}`)
        };
      },
      [touchedInput, errorInput]
    );
  };