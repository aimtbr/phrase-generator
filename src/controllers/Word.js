import { v4 as generateUUID } from 'uuid';
import { WORD_POS_NOUN } from '../lib/constants';


export class Word {
  constructor(wordData) {
    const {
      id = generateUUID(),
      value,
      partOfSpeech,
      categories = [],
      usesCounter = 0,
    } = wordData;

    this.id = id;
    this.value = value;
    this.partOfSpeech = partOfSpeech;
    this.categories = categories;
    this.usesCounter = usesCounter; // TODO: make the property private
  }

  get length() {
    return this.value.length;
  }

  static get default() {
    const defaultWordData = {
      id: "32cc6dd9-88f2-4093-89c9-da76c63e1d51",
      value: "peace",
      partOfSpeech: WORD_POS_NOUN,
      usesCounter: 1,
    };

    const defaultWord = Word.init(defaultWordData);

    return defaultWord;
  }

  static init(wordData) {
    const instance = new Word(wordData);

    return instance;
  }

  hasAnyOfCategories(categories) {
    return this.categories.some((category) => categories.includes(category));
  }

  toString() {
    this.#incUsesCounter();

    return this.value;
  }

  toJSON() {
    const wordData = {
      id: this.id,
      value: this.value,
      partOfSpeech: this.partOfSpeech,
      categories: this.categories,
      usesCounter: this.usesCounter,
    };

    return wordData;
  }

  #incUsesCounter() {
    this.usesCounter += 1;
  }
}