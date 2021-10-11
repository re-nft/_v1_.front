import * as yup from "yup";
import { NUMBER_REGEX } from "renft-front/consts";

yup.addMethod(
  yup.string,
  "isReNumber",
  function(
    message = "must be greater or equal 0.0001 and less or equal to 9999.9999 with maximum 4 precision"
  ) {
    return this.test({
      message,
      name: "isReNumber",
      exclusive: true,
      test: (value) => {
        const str = value?.replace(NUMBER_REGEX, "");
        return str?.length === 0;
      }
    });
  }
);
export const validationSchema = yup.object().shape({
  inputs: yup.array().of(
    yup.object({
      lendAmount: yup
        .number()
        .required("* required")
        .min(1, "must be greater or equal than 1")
        .max(yup.ref("amount"), "cannot be greater than available amount"),
      maxDuration: yup
        .number()
        .required("* required")
        .min(1, "be greater or equal than 1")
        .max(255, "cannot be greater than 255"),
      // @ts-ignore
      borrowPrice: yup.string().required("* required").isReNumber(),
      // @ts-ignore
      nftPrice: yup.string().required("* required").isReNumber(),
      pmToken: yup.number().required("* required").min(0).max(5)
    })
  )
});
