import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { z } from "zod";
import { FONT_SIZES, LINE_HEIGHTS } from "../constants/theme";
import { swimTheme } from "../hooks/useCustomTheme";
import { supabase } from "../lib/supabase";

const step1Schema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const deviceSchema = z.object({
  deviceNumber: z.string().min(1, { message: "Device number is required" }),
  deviceName: z.string().min(1, { message: "Device name is required" }),
});

const step2Schema = z
  .object({
    devices: z.array(deviceSchema).min(1, { message: "At least one device is required" }),
  })
  .superRefine(async (data, ctx) => {
    if (!data.devices || data.devices.length === 0) return;

    const deviceNumbersToCheck = data.devices
      .map((device) => device.deviceNumber?.trim()?.toLowerCase())
      .filter(Boolean);

    try {
      const { data: existingDevices, error } = await supabase
        .from("devices")
        .select("device_number")
        .in("device_number", deviceNumbersToCheck);

      if (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Error checking device numbers",
          path: ["devices"],
        });
        return;
      }

      if (existingDevices && existingDevices.length > 0) {
        const existingDeviceNumbers = new Set(
          existingDevices.map((d) => d.device_number.toLowerCase())
        );

        data.devices.forEach((device, index) => {
          const deviceNumber = device.deviceNumber?.trim()?.toLowerCase();
          if (existingDeviceNumbers.has(deviceNumber)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Device number ${device.deviceNumber} is already registered`,
              path: ["devices", index, "deviceNumber"],
            });
          }
        });
      }
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Error validating device numbers",
        path: ["devices"],
      });
    }
  });

type Step1Data = z.infer<typeof step1Schema>;
type DeviceData = z.infer<typeof deviceSchema>;
type Step2Data = z.infer<typeof step2Schema>;

type RegisterFormProps = {
  onSubmit: (data: Step1Data & Step2Data) => void;
  error?: string;
  loading?: boolean;
};

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, error, loading }) => {
  const flatListRef = useRef<FlatList>(null);
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [devices, setDevices] = useState<DeviceData[]>([{ deviceNumber: "", deviceName: "" }]);
  const [deviceErrors, setDeviceErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1 form
  const {
    control: control1,
    handleSubmit: handleSubmit1,
    formState: { errors: errors1 },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Step 2 form
  const {
    control: control2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
    setError: setError2,
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      devices: [{ deviceNumber: "", deviceName: "" }],
    },
    mode: "onSubmit",
  });

  const handleStep1 = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2 = async (data: Step2Data) => {
    try {
      setDeviceErrors({});

      if (step1Data) {
        const combinedData = {
          ...step1Data,
          devices: data.devices,
        };
        onSubmit(combinedData);
      }
    } catch (error: any) {
      console.error("Validation error:", error);
    }
  };

  return (
    <View>
      <Text style={styles.title}>Create Account</Text>
      <View style={styles.stepIndicatorContainer}>
        <View style={[styles.stepCircle, step === 1 && styles.stepActive]}>
          <Text style={step === 1 ? styles.stepTextActive : styles.stepText}>1</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepCircle, step === 2 && styles.stepActive]}>
          <Text style={step === 2 ? styles.stepTextActive : styles.stepText}>2</Text>
        </View>
      </View>
      {step === 1 && (
        <View>
          <Controller
            control={control1}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="First Name"
                autoCapitalize="words"
                mode="outlined"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                outlineColor={swimTheme.colors.primary}
                activeOutlineColor={swimTheme.colors.primary}
                error={!!errors1.firstName}
              />
            )}
          />
          {errors1.firstName && (
            <Text style={styles.error}>{errors1.firstName.message as string}</Text>
          )}
          <Controller
            control={control1}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Last Name"
                autoCapitalize="words"
                mode="outlined"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                outlineColor={swimTheme.colors.primary}
                activeOutlineColor={swimTheme.colors.primary}
                error={!!errors1.lastName}
              />
            )}
          />
          {errors1.lastName && (
            <Text style={styles.error}>{errors1.lastName.message as string}</Text>
          )}
          <Controller
            control={control1}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="example@gmail.com"
                mode="outlined"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                outlineColor={swimTheme.colors.primary}
                activeOutlineColor={swimTheme.colors.primary}
                error={!!errors1.email}
              />
            )}
          />
          {errors1.email && <Text style={styles.error}>{errors1.email.message as string}</Text>}
          <Controller
            control={control1}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                autoCapitalize="none"
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                outlineColor={swimTheme.colors.primary}
                activeOutlineColor={swimTheme.colors.primary}
                error={!!errors1.password}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword((prev) => !prev)}
                  />
                }
              />
            )}
          />
          {errors1.password && (
            <Text style={styles.error}>{errors1.password.message as string}</Text>
          )}
          <Controller
            control={control1}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm Password"
                autoCapitalize="none"
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                outlineColor={swimTheme.colors.primary}
                activeOutlineColor={swimTheme.colors.primary}
                error={!!errors1.confirmPassword}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                  />
                }
              />
            )}
          />
          {errors1.confirmPassword && (
            <Text style={styles.error}>{errors1.confirmPassword.message as string}</Text>
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              style={loading ? [styles.button, styles.buttonDisabled] : styles.button}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
              onPress={handleSubmit1(handleStep1)}
              loading={loading}
              disabled={loading}
            >
              Next
            </Button>
          </View>
        </View>
      )}
      {step === 2 && (
        <View>
          <Text style={styles.note}>
            Enter the required device number and device name from purchased device/s
          </Text>
          <FlatList
            ref={flatListRef}
            data={devices}
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            style={[styles.deviceList, devices.length > 1 && styles.deviceListWithScrollbar]}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.deviceContainer}>
                <View style={styles.deviceHeader}>
                  <Text style={styles.deviceTitle}>Device {index + 1}</Text>
                  {index > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        const newDevices = [...devices];
                        newDevices.splice(index, 1);
                        setDevices(newDevices);
                      }}
                    >
                      <Text style={styles.removeButton}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Controller
                  control={control2}
                  name={`devices.${index}.deviceNumber`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Device Number"
                      autoCapitalize="none"
                      mode="outlined"
                      style={styles.input}
                      value={value as string}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      outlineColor={swimTheme.colors.primary}
                      activeOutlineColor={swimTheme.colors.primary}
                      error={!!errors2.devices?.[index]?.deviceNumber}
                    />
                  )}
                />
                {(errors2.devices?.[index]?.deviceNumber || deviceErrors[index]) && (
                  <Text style={styles.error}>
                    {deviceErrors[index] || errors2.devices?.[index]?.deviceNumber?.message}
                  </Text>
                )}
                <Controller
                  control={control2}
                  name={`devices.${index}.deviceName`}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      label="Device Name"
                      autoCapitalize="words"
                      mode="outlined"
                      style={styles.input}
                      value={value as string}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      outlineColor={swimTheme.colors.primary}
                      activeOutlineColor={swimTheme.colors.primary}
                      error={!!errors2.devices?.[index]?.deviceName}
                    />
                  )}
                />
                {errors2.devices?.[index]?.deviceName && (
                  <Text style={styles.error}>
                    {errors2.devices[index]?.deviceName?.message as string}
                  </Text>
                )}
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.addDeviceButton}
            onPress={() => {
              setDevices([...devices, { deviceNumber: "", deviceName: "" }]);
              // Small delay to ensure the new device is rendered before scrolling
              setTimeout(() => {
                if (flatListRef.current) {
                  flatListRef.current.scrollToEnd({ animated: true });
                }
              }, 100);
            }}
          >
            <Text style={styles.addDeviceText}>Add Another Device</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              style={[styles.button, styles.backButton, loading && styles.buttonDisabled]}
              labelStyle={[styles.buttonLabel, styles.backButtonLabel]}
              contentStyle={styles.buttonContent}
              onPress={() => setStep(1)}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              mode="contained"
              style={[styles.button, styles.registerButton, loading && styles.buttonDisabled]}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
              onPress={handleSubmit2(handleStep2)}
              loading={loading}
              disabled={loading}
            >
              Register
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  deviceList: {
    maxHeight: 400,
    marginBottom: 10,
  },
  deviceListWithScrollbar: {
    paddingRight: 4, // Add padding to prevent scrollbar from overlapping content
  },
  deviceScrollContainer: {
    maxHeight: 400,
    marginBottom: 10,
  },
  deviceContainer: {
    marginBottom: 16,
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  deviceTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    color: swimTheme.colors.text,
  },
  removeButton: {
    color: swimTheme.colors.notification,
    fontWeight: "600",
  },
  addDeviceButton: {
    backgroundColor: "#fff",
    borderColor: swimTheme.colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  addDeviceText: {
    color: swimTheme.colors.primary,
    fontWeight: "600",
    fontSize: FONT_SIZES.base,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderColor: swimTheme.colors.primary,
    borderWidth: 1,
    marginRight: 0,
    elevation: 0,
  },
  backButtonLabel: {
    color: swimTheme.colors.primary,
    fontWeight: "700",
  },
  registerButton: {
    flex: 1,
    marginLeft: 0,
    elevation: 2,
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  stepActive: {
    backgroundColor: swimTheme.colors.primary,
  },
  stepText: {
    color: swimTheme.colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  stepTextActive: {
    color: swimTheme.colors.card,
    fontWeight: "700",
    fontSize: 16,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  note: {
    fontSize: FONT_SIZES.sm,
    color: swimTheme.colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  title: {
    fontSize: FONT_SIZES.xl,
    lineHeight: LINE_HEIGHTS.xl,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: swimTheme.colors.text,
  },
  input: {
    fontSize: FONT_SIZES.base,
    lineHeight: LINE_HEIGHTS.base,
    marginBottom: 16,
    backgroundColor: "#fff",
    color: swimTheme.colors.text,
  },
  error: {
    fontSize: FONT_SIZES.sm,
    marginBottom: 8,
    textAlign: "center",
    color: swimTheme.colors.notification,
  },
  button: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 0,
    width: "100%",
    backgroundColor: swimTheme.colors.primary,
    borderRadius: 32,
    height: 42,
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonLabel: {
    color: swimTheme.colors.card,
    fontWeight: "700",
    fontSize: FONT_SIZES.md,
    letterSpacing: 0.5,
  },
  buttonContent: {
    height: 56,
  },
});

export default RegisterForm;
