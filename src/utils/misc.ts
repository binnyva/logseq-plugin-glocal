import { tagColors } from "../constants";

export const zeroPad = (num: number, places: number): string =>
  String(num).padStart(places, "0");

export const getTagColor = (tag: string) => {
  let color;
  if (tagColors[tag]) {
    color = tagColors[tag];
  } else {
    color = getRandomColor();
    tagColors[tag] = color;
  }
  return color;
};

export const getRandomColor = () => {
  const limit = 360;
  const hue = Math.floor(Math.random() * limit);
  return `hsl(${hue}deg, 50%, 50%)`;
};

export function* chunk<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}
