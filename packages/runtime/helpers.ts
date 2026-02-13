import { faker } from "@faker-js/faker";

type StateMap = Record<string, any>;
const state: StateMap = {};

export const templateHelpers = {
  uuid: () => crypto.randomUUID(),
  randomInt: (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min,
  randomBool: () => Math.random() < 0.5,

  arrayFrom: <T>(length: number, fn: (i: number) => T) =>
    Array.from({ length }, (_, i) => fn(i)),
  choice: <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)],

  setState: (key: string, value: any) => {
    state[key] = value;
    return value;
  },
  getState: (key: string, defaultValue?: any) =>
    key in state ? state[key] : defaultValue,

  faker,
};

export type TemplateHelpers = typeof templateHelpers;
