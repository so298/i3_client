export const createRandomId = () => {
  const minimum = 1;
  const maximum = 100000;
  const randomId = Math.floor(Math.random() * (maximum - minimum)) + minimum;
  return randomId;
};
