import { faker } from "@faker-js/faker";

type StateMap = Record<string, any>;
const state: StateMap = {};

export const TemplateHelpers = {
  randomInt: (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min,
  randomBool: () => Math.random() < 0.5,
  choice: <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)],
  arrayFrom: <T>(length: number, fn: (i: number) => T) =>
    Array.from({ length }, (_, i) => fn(i)),
  uuid: () => crypto.randomUUID(),
  faker,
  capitalize: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
  slugify: (str: string) => str.toLowerCase().replace(/\s+/g, "-"),
  truncate: (str: string, length: number) => str.slice(0, length),
  now: () => new Date(),
  today: () => new Date().toISOString().split("T")[0],
  addDays: (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  },
  subtractDays: (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  },

  setState: (key: string, value: any) => {
    state[key] = value;
    return value;
  },
  getState: (key: string, defaultValue?: any) =>
    key in state ? state[key] : defaultValue,
  shuffle: <T>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5),
  range: (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i),
  noop: () => null,
};
