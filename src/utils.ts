export const short = (s: string): string =>
  `${s.substr(0, 5)}...${s.substr(s.length - 5, 5)}`;
