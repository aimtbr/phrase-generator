import { Dictionary } from './Dictionary.js';
import {
  WORD_POS_ADJECTIVE,
  WORD_POS_NOUN,
} from '../lib/constants.js';
import { getRandomItem } from '../lib/helpers.js';


export class Phrase {
  constructor(adjective, noun) {
    this.adjective = adjective;
    this.noun = noun;
  }

  static init(adjective, noun) {
    const phrase = new Phrase(adjective, noun);

    return phrase;
  }

  static async generate(dictionary) {
    const isDictionaryValid = dictionary instanceof Dictionary;

    // if dictionary is not provided then initialize the default one
    if (!isDictionaryValid) {
      dictionary = await Dictionary.init();
    }

    // get a random adjective
    const adjective = await dictionary.getRandomWord(WORD_POS_ADJECTIVE);

    // get the words belonging to one of the categories
    const nounsMatched = await dictionary.getWords(WORD_POS_NOUN, adjective.categories);

    // if any of the nouns matched then get a random one from them
    // otherwise get a random noun
    const isAnyNounMatched = nounsMatched.length > 0;

    let noun;

    if (isAnyNounMatched) {
      noun = getRandomItem(nounsMatched);
    } else {
      noun = await dictionary.getRandomWord(WORD_POS_NOUN);
    }

    const phrase = Phrase.init(adjective, noun);

    await dictionary.save();

    return phrase;
  }

  toString() {
    return `${this.adjective.toString()} ${this.noun.toString()}`;
  }
}