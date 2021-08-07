import { Phrase } from './controllers/Phrase.js';


const start = async () => {
  const phrase = await Phrase.generate();

  console.log(phrase);
};


start();