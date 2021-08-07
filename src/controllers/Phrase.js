import { Dictionary } from './Dictionary.js';
import { Word } from './Word.js';
import {
  WORD_POS_ADJECTIVE,
  WORD_POS_NOUN,
} from '../lib/constants.js';


export class Phrase {
  static async generate() {
    const build = (adjective, noun) => `${adjective} ${noun}`;

    const dictionary = await Dictionary.init();

    const adjective = await dictionary.getRareWord(WORD_POS_ADJECTIVE);

    const nouns = await dictionary.getWords(WORD_POS_NOUN, adjective.categories);
    const firstNoun = nouns[0];

    const noun = nouns.reduce((accumulator, word) => {
      if (word.usesCounter < accumulator.usesCounter) {
        return word;
      }

      return accumulator;
    }, firstNoun);

    const phrase = build(adjective.toString(), noun.toString());

    await dictionary.save();

    return phrase;
  }
}