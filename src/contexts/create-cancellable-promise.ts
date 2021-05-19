export type CancellablePromise<T> = {
  promise: Promise<T>;
  cancel: () => void;
};

export default function createCancellablePromise<T>(
  promise: Promise<T>
): CancellablePromise<T> {
  let cancel = () => {
    console.warn("nothing to cancel");
  };

  const cancellablePromise: Promise<T> = new Promise(
    (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void
    ) => {
      cancel = () => {
        resolve = () => null;
        reject = () => null;
      };

      promise
        .then(
          (value) => {
            if (resolve) resolve(value);
          },
          (error) => {
            if (reject) reject(error);
          }
        )
        .catch(() => {
          console.warn("cancellable function error");
        });
    }
  );

  return { promise: cancellablePromise, cancel };
}
