export interface Option {
  id: string;
  label: string;
  promptValue: string;
  gender?: 'male' | 'female' | 'unisex';
}

export interface Category {
  id: string;
  label: string;
  options: Option[];
}

export interface Selections {
  [key: string]: string; // category.id -> option.id
}

export type AspectRatio = '9:16' | '16:9' | '1:1' | '21:9';
