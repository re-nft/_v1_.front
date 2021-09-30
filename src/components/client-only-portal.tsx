import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const ClientOnlyPortal: React.FC<{
  selector: string;
}> = ({ children, selector }) => {
  const ref = useRef<Element | null>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const element = document.querySelector(selector);
    if (element) ref.current = element;
    setMounted(true);
  }, [selector]);

  return mounted && ref.current ? createPortal(children, ref.current) : null;
};
