import { v4 as uuid } from "uuid";

export function now() {
  return new Date().toISOString();
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomString(length: number) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export const baseHelpers = {
  uuid,
  now,
  randomInt,
  randomString,
};
