import Error from "next/error";

export const NotFound: React.FC = () => {
  // Opinionated: do not record an exception in Sentry for 404
  return <Error statusCode={404} />;
};

export default NotFound;
