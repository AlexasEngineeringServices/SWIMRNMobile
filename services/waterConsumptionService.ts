export const getWaterConsumption = async (userId: string) => {
  try {
    // Simulating an API call with mock data
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      data: {
        dailyTarget: 2000,
        consumed: 1500,
        dailyGoal: 75,
      },
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      error: error.message || "Failed to fetch water consumption",
    };
  }
};

export const updateWaterConsumption = async (userId: string, deviceId: string, amount: number) => {
  try {
    // Simulating an API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { error: null };
  } catch (error: any) {
    return { error: error.message || "Failed to update water consumption" };
  }
};
