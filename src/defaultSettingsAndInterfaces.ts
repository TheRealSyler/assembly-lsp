export interface Settings {}
export type FileSettings = {
  tabSize: number;
  insertSpaces: boolean;
};
export const defaultFileSettings: FileSettings = {
  insertSpaces: false,
  tabSize: 2,
};
export const defaultSettings: Settings = {};
