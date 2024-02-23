export const shortenKeyHelper = (key: string) => {
  if (key.length <= 10) {
    return key; // return short keys
  }

  const firstFive = key.substring(0, 5); // first 5
  const lastFive = key.substring(key.length - 5); // last 5

  return firstFive + "..." + lastFive; // concat
};
