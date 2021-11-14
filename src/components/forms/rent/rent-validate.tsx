import * as yup from "yup";

export const validationSchema = yup.object().shape({
  inputs: yup.array().of(
    yup.object({
      duration: yup
        .number()
        .label("Rent duration")
        .typeError("${path} must be number")
        .integer("${path} must be an integer")
        .required("${path} is required")
        .min(1, "${path} must be greater or equal than 1")
        .max(
          yup.ref("maxRentDuration"),
          "${path} cannot be greater than maximum duration"
        ),
    })
  ),
});
