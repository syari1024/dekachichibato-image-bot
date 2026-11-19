import { toHiragana } from "wanakana";

export const isIncludedDekachichibato = (text: string): boolean => {
  const normalizedText = text.normalize("NFKC").toLocaleLowerCase();
  const hiraganaText = toHiragana(normalizedText);
  return hiraganaText.includes("でかちちばと");
};
