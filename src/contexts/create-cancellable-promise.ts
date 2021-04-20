/* eslint-disable */

type CancelPromise = () => void;

export type CancellablePromise<T> = {
    promise: Promise<T>;
    cancel: CancelPromise;
}

// todo: what is this Function O_O

export default function createCancellablePromise<T>(promise: Promise<T>): CancellablePromise<T> {
    let cancel: CancelPromise = Function;
    const cancellablePromise: Promise<T> = new Promise((resolve: Function | null, reject: Function | null) => {
        cancel = () => {
            resolve = null;
            reject = null;
        };

        promise.then(
            (value) => {
                if (resolve) {
                    resolve(value);
                }
            },
            (error) => {
                if (reject) {
                    reject(error);
                }
            }
        ).catch(() => { console.warn('weird function error'); });
    });

    return {promise: cancellablePromise, cancel};
}
