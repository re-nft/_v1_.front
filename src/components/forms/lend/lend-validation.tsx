import * as yup from "yup";
import { NUMBER_REGEX } from "renft-front/consts";

yup.addMethod(
  yup.string,
  "isReNumber",
  function (
    message = "${path} must be greater or equal 0.0001 and less or equal to 9999.9999 with maximum 4 precision"
  ) {
    return this.test({
      message,
      name: "isReNumber",
      exclusive: true,
      test: (value) => {
        const str = value?.replace(NUMBER_REGEX, "");
        return str?.length === 0;
      },
    });
  }
);
export const validationSchema = yup.object().shape({
  inputs: yup.array().of(
    yup.object({
      lendAmount: yup
        .number()
        .label("Amount")
        .typeError("${path} must be number")
        .required("${path} required")
        .integer("${path} must be an integer")
        .min(1, "${path} must be greater or equal than 1")
        .max(
          yup.ref("amount"),
          "${path} cannot be greater than available amount"
        ),
      maxDuration: yup
        .number()
        .label("Max lend duration")
        .typeError("${path} must be number")
        .required("${path} * required")
        .integer("${path} must be an integer")
        .min(1, "${path} must be greater or equal than 1")
        .max(255, "${path} cannot be greater than 255"),
      // @ts-ignore
      borrowPrice: yup
        .string()
        .label("Borrow price")
        .typeError("${path} must be number")
        .required("${path} * required")
        // @ts-ignore
        .isReNumber(),
      // @ts-ignore
      nftPrice: yup
        .string()
        .label("Collateral")
        .typeError("${path} must be number")
        .required("${path} * required")
        // @ts-ignore
        .isReNumber(),
      pmToken: yup
        .number()
        .label("Payment token")
        .typeError("${path} must be number")
        .required("${path} * required")
        .min(0)
        .max(5),
    })
  ),
});
