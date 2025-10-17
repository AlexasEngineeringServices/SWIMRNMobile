export interface WaterUsageData {
  roundCount: number;
  slimCount: number;
  roundVoidCount: number;
  slimVoidCount: number;
  enqueuedAt: string;
  azureDeviceId: string;
}

export const mockWaterUsageData: WaterUsageData[] = [
  // Today's data (Oct 16)
  {
    roundCount: 8,
    slimCount: 4,
    roundVoidCount: 3.0,
    slimVoidCount: 2.0,
    enqueuedAt: new Date(2025, 9, 16, 14, 30).toISOString(),
    azureDeviceId: "device-001",
  },
  {
    roundCount: 5,
    slimCount: 3,
    roundVoidCount: 2.5,
    slimVoidCount: 1.5,
    enqueuedAt: new Date(2025, 9, 15, 9, 15).toISOString(),
    azureDeviceId: "device-001",
  },
  // Oct 11 data
  {
    roundCount: 7,
    slimCount: 4,
    roundVoidCount: 3.0,
    slimVoidCount: 2.0,
    enqueuedAt: new Date(2025, 9, 11, 16, 45).toISOString(),
    azureDeviceId: "device-001",
  },
  {
    roundCount: 6,
    slimCount: 3,
    roundVoidCount: 2.5,
    slimVoidCount: 1.5,
    enqueuedAt: new Date(2025, 9, 11, 13, 30).toISOString(),
    azureDeviceId: "device-001",
  },
  {
    roundCount: 4,
    slimCount: 2,
    roundVoidCount: 1.8,
    slimVoidCount: 1.2,
    enqueuedAt: new Date(2025, 9, 11, 9, 15).toISOString(),
    azureDeviceId: "device-001",
  },
  // Additional October data
  // Oct 10
  {
    roundCount: 9,
    slimCount: 5,
    roundVoidCount: 3.5,
    slimVoidCount: 2.5,
    enqueuedAt: new Date(2025, 9, 10, 17, 30).toISOString(),
    azureDeviceId: "device-001",
  },
  // Oct 9
  {
    roundCount: 6,
    slimCount: 3,
    roundVoidCount: 2.8,
    slimVoidCount: 1.7,
    enqueuedAt: new Date(2025, 9, 9, 15, 45).toISOString(),
    azureDeviceId: "device-001",
  },
  // Oct 8
  {
    roundCount: 8,
    slimCount: 4,
    roundVoidCount: 3.2,
    slimVoidCount: 2.1,
    enqueuedAt: new Date(2025, 9, 8, 16, 20).toISOString(),
    azureDeviceId: "device-001",
  },
  // Oct 7
  {
    roundCount: 7,
    slimCount: 3,
    roundVoidCount: 2.9,
    slimVoidCount: 1.8,
    enqueuedAt: new Date(2025, 9, 7, 14, 15).toISOString(),
    azureDeviceId: "device-001",
  },
  // Oct 6
  {
    roundCount: 5,
    slimCount: 2,
    roundVoidCount: 2.2,
    slimVoidCount: 1.4,
    enqueuedAt: new Date(2025, 9, 6, 13, 40).toISOString(),
    azureDeviceId: "device-001",
  },
  // Oct 5
  {
    roundCount: 10,
    slimCount: 5,
    roundVoidCount: 4.0,
    slimVoidCount: 2.6,
    enqueuedAt: new Date(2025, 9, 5, 18, 10).toISOString(),
    azureDeviceId: "device-001",
  },
  // Oct 4
  {
    roundCount: 7,
    slimCount: 4,
    roundVoidCount: 3.1,
    slimVoidCount: 1.9,
    enqueuedAt: new Date(2025, 9, 4, 16, 55).toISOString(),
    azureDeviceId: "device-001",
  },
  // Oct 3
  {
    roundCount: 6,
    slimCount: 3,
    roundVoidCount: 2.7,
    slimVoidCount: 1.6,
    enqueuedAt: new Date(2025, 9, 3, 15, 25).toISOString(),
    azureDeviceId: "device-001",
  },
  // Oct 2
  {
    roundCount: 8,
    slimCount: 4,
    roundVoidCount: 3.3,
    slimVoidCount: 2.2,
    enqueuedAt: new Date(2025, 9, 2, 17, 5).toISOString(),
    azureDeviceId: "device-001",
  },
  // Oct 1
  {
    roundCount: 5,
    slimCount: 2,
    roundVoidCount: 2.1,
    slimVoidCount: 1.3,
    enqueuedAt: new Date(2025, 9, 1, 14, 50).toISOString(),
    azureDeviceId: "device-001",
  },
  // Device 002 - additional device entries
  // Oct 13 (3 readings)
  {
    roundCount: 2,
    slimCount: 10,
    roundVoidCount: 1,
    slimVoidCount: 1,
    enqueuedAt: new Date(2025, 9, 13, 9, 15).toISOString(),
    azureDeviceId: "device-002",
  },
  {
    roundCount: 1,
    slimCount: 8,
    roundVoidCount: 0,
    slimVoidCount: 1,
    enqueuedAt: new Date(2025, 9, 13, 13, 30).toISOString(),
    azureDeviceId: "device-002",
  },
  {
    roundCount: 3,
    slimCount: 12,
    roundVoidCount: 1,
    slimVoidCount: 2,
    enqueuedAt: new Date(2025, 9, 13, 16, 45).toISOString(),
    azureDeviceId: "device-002",
  },
  // Today Oct 17 for device-002
  {
    roundCount: 4,
    slimCount: 14,
    roundVoidCount: 2,
    slimVoidCount: 2,
    enqueuedAt: new Date(2025, 9, 17, 10, 30).toISOString(),
    azureDeviceId: "device-002",
  },

  // Device 003
  // Oct 13 (3 readings)
  {
    roundCount: 10,
    slimCount: 2,
    roundVoidCount: 2,
    slimVoidCount: 1,
    enqueuedAt: new Date(2025, 9, 13, 8, 5).toISOString(),
    azureDeviceId: "device-003",
  },
  {
    roundCount: 12,
    slimCount: 3,
    roundVoidCount: 3,
    slimVoidCount: 1,
    enqueuedAt: new Date(2025, 9, 13, 12, 20).toISOString(),
    azureDeviceId: "device-003",
  },
  {
    roundCount: 9,
    slimCount: 1,
    roundVoidCount: 1,
    slimVoidCount: 0,
    enqueuedAt: new Date(2025, 9, 13, 18, 40).toISOString(),
    azureDeviceId: "device-003",
  },
  // Today Oct 17 for device-003
  {
    roundCount: 7,
    slimCount: 2,
    roundVoidCount: 1,
    slimVoidCount: 1,
    enqueuedAt: new Date(2025, 9, 17, 11, 5).toISOString(),
    azureDeviceId: "device-003",
  },

  // Device 004
  // Oct 13 (3 readings)
  {
    roundCount: 4,
    slimCount: 6,
    roundVoidCount: 1,
    slimVoidCount: 1,
    enqueuedAt: new Date(2025, 9, 13, 7, 50).toISOString(),
    azureDeviceId: "device-004",
  },
  {
    roundCount: 5,
    slimCount: 7,
    roundVoidCount: 1,
    slimVoidCount: 2,
    enqueuedAt: new Date(2025, 9, 13, 13, 55).toISOString(),
    azureDeviceId: "device-004",
  },
  {
    roundCount: 6,
    slimCount: 9,
    roundVoidCount: 2,
    slimVoidCount: 2,
    enqueuedAt: new Date(2025, 9, 13, 20, 15).toISOString(),
    azureDeviceId: "device-004",
  },
  // Today Oct 17 for device-004
  {
    roundCount: 8,
    slimCount: 10,
    roundVoidCount: 2,
    slimVoidCount: 3,
    enqueuedAt: new Date(2025, 9, 17, 9, 45).toISOString(),
    azureDeviceId: "device-004",
  },
];
