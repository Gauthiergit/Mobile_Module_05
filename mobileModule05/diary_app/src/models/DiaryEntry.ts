import { Feeling } from "../types/Feeling";

export interface DiaryEntry{
  id: string;
  title: string;
  feeling: Feeling;
  content: string;
  date: Date;
}