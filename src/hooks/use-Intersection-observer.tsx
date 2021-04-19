import { useRef, useState, useCallback, useEffect } from 'react';

const DEFAULT_ROOT = null;
const DEFAULT_ROOT_MARGIN = '0px';
const DEFAULT_THRESHOLD = [0];

export type IntersectionObserverHookRefCallbackNode = Element | null;

export type IntersectionObserverHookRefCallback = (
  node: IntersectionObserverHookRefCallbackNode
) => void;

export type IntersectionObserverHookResult = [
  IntersectionObserverHookRefCallback,
  { entry: IntersectionObserverEntry | undefined }
];

const useIntersectionObserver = ({root = DEFAULT_ROOT, rootMargin = DEFAULT_ROOT_MARGIN, threshold = DEFAULT_THRESHOLD}: IntersectionObserverInit = {}): IntersectionObserverHookResult => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  useEffect(() => {
    return () => {
      const observer = observerRef.current;
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const refCallback = useCallback(
    (node: IntersectionObserverHookRefCallbackNode) => {
      function getObserver() {
        if (!observerRef.current) {
          observerRef.current = new IntersectionObserver(
            ([entry]) => {
              setEntry(entry);
            },
            { root, rootMargin, threshold }
          );
        }

        return observerRef.current;
      }

      const observer = getObserver();
      observer.disconnect();

      if (node) {
        observer.observe(node);
      }
    },
    [root, rootMargin, threshold]
  );

  return [refCallback, { entry }];
}

export default useIntersectionObserver;