import config from 'config';
import fsPromises from 'fs/promises';

import { Word } from './Word.js';
import {
  WORD_POS_ADJECTIVE,
  WORD_POS_NOUN,
  WORD_POS,
} from '../lib/constants.js';
import {
  getRandomItem,
} from '../lib/helpers.js';


const defaultDictionaryPath = config.get('dictionaryPath');

export class Dictionary {
  empty = true;
  adjectives = [];
  nouns = [];

  constructor(content) {
    const {
      adjectives,
      nouns,
    } = content;

    this.adjectives = adjectives;
    this.nouns = nouns;

    if (this.adjectives.length > 0 || this.nouns.length > 0) {
      this.empty = false;
    }
  }

  static async init(dictionary) {
    if (dictionary === undefined) {
      dictionary = await Dictionary.initFrom();
    }

    const [adjectives, nouns] = await Promise.all([
      (async () => dictionary.adjectives.map(Word.init))(),
      (async () => dictionary.nouns.map(Word.init))(),
    ]);

    const content = {
      adjectives,
      nouns,
    };

    const instance = new Dictionary(content);

    return instance;
  }

  static async initFrom(dictionaryPath = defaultDictionaryPath) {
    // supports JSON dictionary import
    const dictionary = await import(dictionaryPath);

    const instance = Dictionary.init(dictionary);

    return instance;
  }

  async getRandomWord(partOfSpeech) {
    if (this.empty) {
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

  async getRareWords(partOfSpeech) {
    const wordList = this.#getWordList(partOfSpeech);

    const firstWord = wordList[0];

    const rareWords = wordList.reduce((accumulator, word) => {
      const accumulatorItem = accumulator[0];

      if (word.usesCounter < accumulatorItem.usesCounter) {
        return [word];
      } else if (word.usesCounter === accumulatorItem.usesCounter) {
        return [...accumulator, word];
      }

      return accumulator;
    }, [firstWord]);

    return rareWords;
  }

  // get a random word from the most rarely used ones
  async getRareWord(partOfSpeech) {
    const rareWords = await this.getRareWords(partOfSpeech);

    const randomRareWord = getRandomItem(rareWords);

    return randomRareWord;
  }

  async getWord(partOfSpeech, categories) {
    const wordList = this.#getWordList(partOfSpeech);

    const wordsMatched = await Promise.any(wordList.map(async (word) => {
      if (word.hasAnyOfCategories(categories)) {
        return word;
      }

      throw new Error('Word does not match any of categories');
    })); // TODO: HANDLE ERROR, RAISING WHEN THERE IS NO MATCHING CATEGORY

    return wordsMatched;
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
      adjectives: this.adjectives,
      nouns: this.nouns,
    };

    return dictionary;
  }

  async save() {
    const dictionarySerialized = JSON.stringify(this, null, '  ');

    return fsPromises.writeFile(defaultDictionaryPath, dictionarySerialized);
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
}