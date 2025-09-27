import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { FONT_SIZES } from "../constants/theme";
import { swimTheme } from "../hooks/useCustomTheme";
import { supabase } from "../lib/supabase";
import { sendVerificationEmail } from "../services/email";

export default function VerifyEmail() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState<boolean>(false);
  const [userData, setUserData] = useState<{
    user_id?: string;
    email?: string;
    firstname?: string;
  } | null>(null);

  useEffect(() => {
    async function verifyEmail() {
      try {
        if (!token) {
          setError("No verification token provided");
          setVerifying(false);
          return;
        }

        const { data: tokenData, error: verifyError } = await supabase
          .from("email_verification_tokens")
          .select("user_id, expires_at")
          .eq("token", token)
          .single();

        if (verifyError || !tokenData) {
          setError("Invalid or expired verification token");
          setVerifying(false);
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, email, firstname")
          .eq("id", tokenData.user_id)
          .single();

        if (profileData) {
          setUserData({
            user_id: profileData.id,
            email: profileData.email,
            firstname: profileData.firstname,
          });
        }

        const expiresAt = new Date(tokenData.expires_at);
        if (expiresAt < new Date()) {
          setError("Verification token has expired");
          setVerifying(false);
          return;
        }

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ email_verified: true })
          .eq("id", tokenData.user_id);

        if (updateError) {
          setError("Failed to verify email");
          setVerifying(false);
          return;
        }

        await supabase.from("email_verification_tokens").delete().eq("token", token);
        router.replace("/auth");
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
        setVerifying(false);
      }
    }

    verifyEmail();
  }, [token, router]);

  const handleResendVerification = async () => {
    try {
      setResending(true);
      if (!userData?.user_id || !userData.email) {
        throw new Error("Missing user data for resend");
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
