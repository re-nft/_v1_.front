export const getPerson = async () => {
  const response = await fetch("https://pipl.ir/v1/getPerson");
  console.error(response);
  return "";
};
