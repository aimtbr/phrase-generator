export const getRandomNumber = (max, min = 0) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber;
};

export const getRandomItem = (array) => {
  const randomIndex = getRandomNumber(array.length - 1);

  const randomItem = array[randomIndex];

  return randomItem;
};