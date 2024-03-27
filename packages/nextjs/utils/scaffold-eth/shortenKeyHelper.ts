export const shortenKeyHelper = (key: string, start = 5, end = 5) => {
  if (key.length <= 10) {
    return key; // return short keys
  }

  const firstFive = key.substring(0, start); // first 5
  const lastFive = key.substring(key.length - end); // last 5

  return firstFive + "..." + lastFive; // concat
};
