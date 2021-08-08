import config from 'config';
import fsPromises from 'fs/promises';

import { Word } from './Word.js';
import {
  WORD_POS_ADJECTIVE,
  WORD_POS_NOUN,
  WORD_POS,
  DICTIONARY_LANGUAGE_EN,
} from '../lib/constants.js';
import {
  getRandomItem,
} from '../lib/helpers.js';


const DICTIONARY_DEFAULT_PATH = config.get(`dictionary.${DICTIONARY_LANGUAGE_EN}`);

export class Dictionary {
  adjectives = [];
  nouns = [];
  #empty = true;
  #path;

  constructor(params) {
    const {
      content,
      path,
      language,
    } = params;

    const {
      adjectives,
      nouns,
    } = content;

    this.adjectives = adjectives;
    this.nouns = nouns;
    this.#path = path;
    this.language = language;

    if (this.adjectives.length > 0 || this.nouns.length > 0) {
      this.#empty = false;
    }
  }

  static async init(options) {
    const defaultOptions = {
      path: DICTIONARY_DEFAULT_PATH,
    };

    if (!options) {
      options = defaultOptions;
    }

    let {
      dictionary,
      path,
    } = options;

    if (path && !dictionary) {
      // supports JSON dictionary import
      const dictionaryString = await fsPromises.readFile(path, 'utf8');

      dictionary = JSON.parse(dictionaryString);
    }

    const {
      content,
      language,
    } = dictionary;

    const [adjectives, nouns] = await Promise.all([
      (async () => content.adjectives.map(Word.init))(),
      (async () => content.nouns.map(Word.init))(),
    ]);

    const params = {
      content: {
        adjectives,
        nouns,
      },
      path,
      language,
    };

    const instance = new Dictionary(params);

    return instance;
  }

  async getRandomWord(partOfSpeech) {
    if (this.#empty) {
      throw new Error('Initialize a dictionary before querying a word from it (Dictionary.init or Dictionary.initFrom)');
    }

    // if pos was not provided, then get a random POS
    if (partOfSpeech === undefined) {
      partOfSpeech = getRandomItem(WORD_POS);
    }

    const wordList = this.#getWordList(partOfSpeech);

    if (wordList === undefined) {
      throw new Error('Invalid part of speech');
    }

    const randomWord = getRandomItem(wordList);

    return randomWord;
  }

  async getWord(partOfSpeech, categories) {
    const wordList = this.#getWordList(partOfSpeech);

    const wordMatched = await Promise.any(wordList.map(async (word) => {
      if (word.hasAnyOfCategories(categories)) {
        return word;
      }

      return null;
    }));

    return wordMatched;
  }

  async getWords(partOfSpeech, categories) {
    const wordList = this.#getWordList(partOfSpeech);

    const wordsProcessed = await Promise.all(wordList.map(async (word) => {
      if (word.hasAnyOfCategories(categories)) {
        return word;
      }

      return null;
    }));

    const wordsMatched = wordsProcessed.filter((word) => word !== null);

    return wordsMatched;
  }

  toJSON() {
    const dictionary = {
      language: this.language,
      content: {
        adjectives: this.adjectives,
        nouns: this.nouns,
      },
    };

    return dictionary;
  }

  async save() {
    const dictionarySerialized = JSON.stringify(this, null, '  ');

    return fsPromises.writeFile(this.#path, dictionarySerialized);
  }

  #getWordList(partOfSpeech) {
    const isPartOfSpeech = WORD_POS.includes(partOfSpeech);

    if (!isPartOfSpeech) {
      throw new Error('Invalid part of speech');
    }

    switch (partOfSpeech) {
      case WORD_POS_ADJECTIVE: {
        return this.adjectives;
      }

      case WORD_POS_NOUN: {
        return this.nouns;
      }
    }
  }

  // async getRareWords(partOfSpeech) {
  //   const wordList = this.#getWordList(partOfSpeech);

  //   const firstWord = wordList[0];

  //   const rareWords = wordList.reduce((accumulator, word) => {
  //     const accumulatorItem = accumulator[0];

  //     if (word.usesCounter < accumulatorItem.usesCounter) {
  //       return [word];
  //     } else if (word.usesCounter === accumulatorItem.usesCounter) {
  //       return [...accumulator, word];
  //     }

  //     return accumulator;
  //   }, [firstWord]);

  //   return rareWords;
  // }

  // get a random word from the most rarely used ones
  // async getRareWord(partOfSpeech) {
  //   const rareWords = await this.getRareWords(partOfSpeech);

  //   const randomRareWord = getRandomItem(rareWords);

  //   return randomRareWord;
  // }
}