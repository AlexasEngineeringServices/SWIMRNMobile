import moment from "moment";
import { AzureData } from "../services/azureDataService";

export interface DeviceReadingsStats {
  today: moment.Moment;
  uniqueDates: string[];
  currentReadings: AzureData[];
  currentSum: number;
  lastReadingDate?: string;
  lastReadings: AzureData[];
  latestReading?: AzureData;
  dailyIncrement: number;
  incrementPercent: number;
}

export function useDeviceReadings(deviceReadings: AzureData[]): DeviceReadingsStats {
  const today = moment.utc();

  // Safety check: ensure deviceReadings is an array
  const safeReadings = Array.isArray(deviceReadings) ? deviceReadings : [];

  // Sort readings newest -> oldest, ignoring any missing timestamps
  const readingsSorted = safeReadings
    .filter((entry) => !!entry?.enqueuedAt)
    .sort((a, b) => moment.utc(b.enqueuedAt).valueOf() - moment.utc(a.enqueuedAt).valueOf());

  // Get all unique dates from readings, sorted in descending order
  const uniqueDates = [
    ...new Set(readingsSorted.map((entry) => moment.utc(entry.enqueuedAt).format("YYYY-MM-DD"))),
  ]
    .sort()
    .reverse();

  // Get today's readings
  const currentReadings = readingsSorted.filter((entry: AzureData) =>
    moment.utc(entry.enqueuedAt).isSame(today, "day")
  );

  // Sum of current readings (only today's readings)
  const currentSum = currentReadings.reduce((sum, entry) => sum + entry.roundCount, 0);

  // Get the last reading date (excluding today)
  const lastReadingDate = uniqueDates.find((date) => !moment.utc(date).isSame(today, "day"));

  // Get last readings from the last date and find the latest one based on enqueuedAt
  const lastReadings = readingsSorted
    .filter(
      (entry: AzureData) => moment.utc(entry.enqueuedAt).format("YYYY-MM-DD") === lastReadingDate
    )
    .sort((a, b) => moment.utc(b.enqueuedAt).valueOf() - moment.utc(a.enqueuedAt).valueOf());

  // Latest reading overall (including today). This is what the dashboard cards display.
  const latestReading = readingsSorted[0];

  // Use only today's sum for the increment display
  const dailyIncrement = currentSum;

  // Circular progress value for Increment (normalized between 0 and 1)
  const incrementPercent = Math.max(0, Math.min(1, dailyIncrement / 10));

  return {
    today,
    uniqueDates,
    currentReadings,
    currentSum,
    lastReadingDate,
    lastReadings,
    latestReading,
    dailyIncrement,
    incrementPercent,
  };
}
