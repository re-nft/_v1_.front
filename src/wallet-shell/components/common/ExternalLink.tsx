import React, { HTMLProps } from "react";

/**
 * Outbound link that handles firing google analytics events
 */
export function ExternalLink({
  target = "_blank",
  href,
  rel = "noopener noreferrer",
  children,
  ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, "as" | "ref" | "onClick"> & {
  href: string;
}) {
  return (
    <a
      target={target}
      rel={rel}
      href={href}
      className="font-medium text-pink-500 no-underline cursor-pointer hover:underline focus:outline-none focus:underline active:no-underline"
      {...rest}
    >
      {children}
    </a>
  );
}
