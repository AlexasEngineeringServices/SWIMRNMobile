import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { FONT_SIZES } from "../constants/theme";
import { swimTheme } from "../hooks/useCustomTheme";
import {
  deleteEmailVerificationToken,
  sendVerificationEmail,
  validateEmailVerificationToken,
} from "../services/email";
import {
  getProfileById,
  getProfileVerificationStatus,
  updateProfileVerificationStatus,
} from "../services/profile";

export default function VerifyEmail() {
  const params = useLocalSearchParams();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const router = useRouter();

  const [verifying, setVerifying] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [userData, setUserData] = useState<{
    user_id?: string;
    email?: string;
    firstname?: string;
  } | null>(null);

  useEffect(() => {
    async function verifyEmail() {
      try {
        if (!token || token === "undefined") {
          console.error("Invalid token format:", token);
          setError("No verification token provided");
          setVerifying(false);
          return;
        }

        // First check if the email is already verified
        const { data: existingProfile, error: verificationError } =
          await getProfileVerificationStatus(email);
        if (verificationError) {
          console.error("Error checking profile verification status", verificationError);
          setError("Error checking profile verification status");
          setVerifying(false);
          return;
        }
        if (existingProfile?.is_verified) {
          setSuccess(true);
          setVerifying(false);
          return;
        }

        const { data: tokenData, error: verifyError } = await validateEmailVerificationToken(
          token,
          email
        );

        if (verifyError || !tokenData) {
          console.error("Invalid or expired verification token");
          setError("Invalid or expired verification token");
          setVerifying(false);
          return;
        }

        // Get user profile data first, before any other checks
        const { data: profileData, error: profileError } = await getProfileById(tokenData.user_id);
        if (profileError || !profileData) {
          console.error("Could not find user profile");
          setError("Could not find user profile");
          setVerifying(false);
          return;
        }
        // Set user data immediately after getting profile data
        const userDataToSet = {
          user_id: profileData.id,
          email: profileData.email,
          firstname: profileData.firstname,
        };
        setUserData(userDataToSet);

        // Check expiration after setting user data
        const expiresAt = new Date(tokenData.expires_at);
        if (expiresAt < new Date()) {
          console.error("Verification token has expired");
          setError("Verification token has expired");
          setVerifying(false);
          return;
        }

        const { error: updateError } = await updateProfileVerificationStatus(tokenData.user_id);
        if (updateError) {
          console.error("Error updating email verification status: ", updateError);
          setError("Failed to verify email");
          setVerifying(false);
          return;
        }

        const { error: deleteError } = await deleteEmailVerificationToken(token);
        if (deleteError) {
          console.error("Error deleting email verification token: ", deleteError);
          setError("Failed to clean up verification token");
          setVerifying(false);
          return;
        }
        setSuccess(true);
        setVerifying(false);
      } catch (err: any) {
        console.error("Unexpected error during email verification:", err);
        setError(err.message || "An unexpected error occurred");
        setVerifying(false);
      }
    }

    verifyEmail();
  }, [token, router, email]);

  const handleResendVerification = async () => {
    try {
      setResending(true);

      if (!userData) {
        console.error("No user data available");
        throw new Error("User data is not available for resend");
      }

      if (!userData.user_id || !userData.email) {
        console.error("Incomplete user data:", userData);
        throw new Error("Missing required user information for resend");
      }

      const { error: emailError } = await sendVerificationEmail({
        user_id: userData.user_id,
        email: userData.email,
      });

      if (emailError) {
        throw new Error(emailError);
      }

      Alert.alert(
        "Verification Email Sent",
        "Please check your email for the new verification link.",
        [{ text: "OK", onPress: () => router.replace("/auth") }]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to resend verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (verifying) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.title}>Verifying your email...</Text>
          <Text style={styles.subtitle}>
            Please wait while we confirm your email address. This will only take a moment.
          </Text>
        </View>
        <View style={styles.brandingContainer}>
          <Text style={styles.brandingText}>Powered by</Text>
          <Text style={styles.appName}>SWIM App</Text>
        </View>
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Email Verified!</Text>
          <Text style={styles.subtitle}>Your email has been successfully verified!</Text>
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

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.errorTitle}>Verification Failed</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.errorSubtext}>
            {error.includes("expired")
              ? "Your verification link has expired. Please request a new one."
              : "Something went wrong with the verification. Please try again."}
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleResendVerification}
              disabled={resending}
              loading={resending}
              style={resending ? [styles.button, styles.buttonDisabled] : styles.button}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
            >
              {resending ? "Sending..." : "Resend Verification Email"}
            </Button>
          </View>
        </View>
        <View style={styles.brandingContainer}>
          <Text style={styles.brandingText}>Powered by</Text>
          <Text style={styles.appName}>SWIM App</Text>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  title: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    textAlign: "center",
    color: "#666666",
    fontSize: 16,
    lineHeight: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FF3B30",
    marginBottom: 12,
  },
  errorMessage: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 16,
  },
  errorSubtext: {
    textAlign: "center",
    color: "#666666",
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 24,
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
  brandingContainer: {
    marginTop: 40,
    alignItems: "center",
    paddingBottom: 20,
  },
  brandingText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  appName: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "700",
    marginTop: 4,
  },
});
