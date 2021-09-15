import * as yup from "yup";


export const validationSchema = yup.object().shape({
  inputs: yup.array().of(
    yup.object({
      duration: yup
        .number()
        .required("* required")
        .min(1, "must be greater or equal than 1")
        .max(yup.ref("lending.maxRentDuration"), "cannot be greater than maximum duration"),
    })
  )
});
