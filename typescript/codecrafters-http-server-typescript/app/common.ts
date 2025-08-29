export const crlf = "\r\n";

export const lazy = <T>(create: () => T): () => T => {
  let value: T | undefined;

  return () => {
    if (value === undefined) value = create();

    return value;
  };
};

export const sanitize = (pathname: string) => pathname;
