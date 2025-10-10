export interface WaterUsageData {
  roundCount: number;
  slimCount: number;
  roundVoidCount: number;
  slimVoidCount: number;
  enqueuedAt: string;
  azureDeviceId: string;
}

export const mockWaterUsageData: WaterUsageData[] = [
  // Today's data (Oct 10)
  {
    roundCount: 6,
    slimCount: 3,
    roundVoidCount: 2.5,
    slimVoidCount: 1.5,
    enqueuedAt: new Date(2025, 9, 10, 14, 30).toISOString(),
    azureDeviceId: "device-001",
  },
  {
    roundCount: 4,
    slimCount: 2,
    roundVoidCount: 1.8,
    slimVoidCount: 1.2,
    enqueuedAt: new Date(2025, 9, 10, 10, 15).toISOString(),
    azureDeviceId: "device-001",
  },
  // Yesterday's data (Oct 9)
  {
    roundCount: 5,
    slimCount: 2,
    roundVoidCount: 1.5,
    slimVoidCount: 1.0,
    enqueuedAt: new Date(2025, 9, 9, 15, 45).toISOString(),
    azureDeviceId: "device-001",
  },
  {
    roundCount: 4,
    slimCount: 2,
    roundVoidCount: 1.5,
    slimVoidCount: 1.0,
    enqueuedAt: new Date(2025, 9, 9, 10, 45).toISOString(),
    azureDeviceId: "device-001",
  },
  // Last week's data
  {
    roundCount: 6,
    slimCount: 4,
    roundVoidCount: 3.0,
    slimVoidCount: 2.0,
    enqueuedAt: new Date(2025, 9, 2, 9, 30).toISOString(),
    azureDeviceId: "device-001",
  },
  // Last month's data
  {
    roundCount: 7,
    slimCount: 5,
    roundVoidCount: 3.5,
    slimVoidCount: 2.5,
    enqueuedAt: new Date(2025, 8, 15, 11, 20).toISOString(),
    azureDeviceId: "device-001",
  },
];
