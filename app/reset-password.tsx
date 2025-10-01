import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { z } from "zod";
import { swimTheme } from "../hooks/useCustomTheme";
import {
  deletePasswordResetToken,
  updatePasswordUser,
  validatePasswordResetToken,
} from "../services/passwordReset";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const params = useLocalSearchParams();
  const token = params.token as string;
  const email = params.email as string;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token || !email) {
        setError("Invalid reset link. Missing required parameters.");
        return;
      }

      try {
        const { valid, error: validationError } = await validatePasswordResetToken(token, email);

        if (validationError || !valid) {
          console.log("Token validation failed:", validationError);
          setError("This reset link is invalid or has expired.");
          return;
        }

        setIsValid(true);
      } catch (error) {
        console.error("Unexpected error during token validation:", error);
        setError("An error occurred while validating your reset link.");
      }
    };

    validateToken();
  }, [token, email]);

  const onSubmit = async (formData: ResetPasswordFormData) => {
    if (!isValid) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate the token again before updating password
      const {
        valid,
        userId,
        error: validationError,
      } = await validatePasswordResetToken(token, email);

      if (validationError || !valid || !userId) {
        throw new Error("This reset link is invalid or has expired.");
      }

      // Update the password
      const { error: updateError } = await updatePasswordUser(userId, formData.password);
      if (updateError) throw updateError;

      // Delete the used token
      await deletePasswordResetToken(token, email);

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred while resetting your password.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Password Reset Successful!</Text>
          <Text style={styles.subtitle}>Your password has been successfully reset!</Text>
          <View style={styles.buttonContainer}>
            <Text style={styles.subtitle}>
              You can now sign in to your account in the SWIM App. You may close this tab.
            </Text>
          </View>
        </View>
        <View style={styles.brandingContainer}>
          <Text style={styles.brandingText}>Powered by</Text>
          <Text style={styles.appName}>SWIM App</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {error ? (
          <>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.errorTitle}>Invalid Link!</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Text style={styles.errorSubtext}>
              Please open the SWIM App and select &quot;Forgot Password&quot; again to receive a new
              reset link.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your new password below</Text>
            <View style={styles.formContainer}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="New Password"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showPassword}
                      mode="outlined"
                      style={styles.input}
                      disabled={!isValid || loading}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? "eye-off" : "eye"}
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                      error={!!errors.password}
                      outlineColor={swimTheme.colors.primary}
                      textColor={swimTheme.colors.text}
                      theme={{
                        colors: {
                          placeholder: swimTheme.colors.text,
                          text: swimTheme.colors.text,
                          primary: swimTheme.colors.primary,
                        },
                      }}
                      activeOutlineColor={swimTheme.colors.primary}
                    />
                    {errors.password && (
                      <HelperText type="error">{errors.password.message}</HelperText>
                    )}
                  </View>
                )}
              />
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Confirm New Password"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showConfirmPassword}
                      mode="outlined"
                      style={styles.input}
                      disabled={!isValid || loading}
                      right={
                        <TextInput.Icon
                          icon={showConfirmPassword ? "eye-off" : "eye"}
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      }
                      error={!!errors.confirmPassword}
                      outlineColor={swimTheme.colors.primary}
                      textColor={swimTheme.colors.text}
                      theme={{
                        colors: {
                          placeholder: swimTheme.colors.text,
                          text: swimTheme.colors.text,
                          primary: swimTheme.colors.primary,
                        },
                      }}
                      activeOutlineColor={swimTheme.colors.primary}
                    />
                    {errors.confirmPassword && (
                      <HelperText type="error">{errors.confirmPassword.message}</HelperText>
                    )}
                  </View>
                )}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                disabled={!isValid || loading}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                contentStyle={styles.buttonContent}
              >
                Reset Password
              </Button>
            </View>
          </>
        )}
      </View>
      <View style={styles.brandingContainer}>
        <Text style={styles.brandingText}>Powered by</Text>
        <Text style={styles.appName}>SWIM App</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: swimTheme.colors.background,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  formContainer: {
    width: "100%",
    marginTop: 24,
  },
  title: {
    marginTop: 16,
    fontSize: 28,
    fontWeight: "700",
    color: swimTheme.colors.text,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    textAlign: "center",
    color: swimTheme.colors.text + "80",
    fontSize: 16,
    lineHeight: 24,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 8,
  },
  buttonContainer: {
    gap: 16,
    alignItems: "center",
    width: "100%",
    marginTop: 24,
  },
  button: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 24,
    minWidth: 220,
    alignSelf: "center",
    backgroundColor: swimTheme.colors.primary,
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buttonContent: {
    height: 56,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FF3B30",
    marginTop: 12,
    marginBottom: 26,
  },
  errorMessage: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 36,
    fontSize: 16,
  },
  errorSubtext: {
    textAlign: "center",
    color: swimTheme.colors.text + "80",
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 24,
  },
  brandingContainer: {
    marginTop: 40,
    alignItems: "center",
    paddingBottom: 20,
  },
  brandingText: {
    fontSize: 14,
    color: swimTheme.colors.text + "80",
    fontWeight: "500",
  },
  appName: {
    fontSize: 16,
    color: swimTheme.colors.text,
    fontWeight: "700",
    marginTop: 4,
  },
});
