import { DiaryEntry } from "../models/DiaryEntry";
import { Feeling } from "../types/Feeling";

export function calculatePercentage(feel: Feeling, entries: DiaryEntry[]): string
{
    const filteredEntries = entries.filter(entry => entry.feeling == feel);
    const percentage = filteredEntries.length / entries.length * 100;
    return percentage.toFixed().toString();
}