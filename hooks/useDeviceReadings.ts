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

  // Get all unique dates from readings, sorted in descending order
  const uniqueDates = [
    ...new Set(safeReadings.map((entry) => moment.utc(entry.enqueuedAt).format("YYYY-MM-DD"))),
  ]
    .sort()
    .reverse();

  // Get today's readings
  const currentReadings = safeReadings.filter((entry: AzureData) =>
    moment.utc(entry.enqueuedAt).isSame(today, "day")
  );

  // Sum of current readings (only today's readings)
  const currentSum = currentReadings.reduce((sum, entry) => sum + entry.roundCount, 0);

  // Get the last reading date (excluding today)
  const lastReadingDate = uniqueDates.find((date) => !moment.utc(date).isSame(today, "day"));

  // Get last readings from the last date and find the latest one based on enqueuedAt
  const lastReadings = safeReadings
    .filter(
      (entry: AzureData) =>
        moment.utc(entry.enqueuedAt).format("YYYY-MM-DD") === lastReadingDate
    )
    .sort((a, b) => moment.utc(b.enqueuedAt).valueOf() - moment.utc(a.enqueuedAt).valueOf());

  // Get only the latest reading
  const latestReading = lastReadings[0];

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
