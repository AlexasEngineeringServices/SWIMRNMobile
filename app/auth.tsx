import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { Button, Modal as PaperModal, Portal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { swimTheme } from "../hooks/useCustomTheme";
import { signInWithEmail, signUpWithEmail } from "../services/auth";
import { sendVerificationEmail } from "../services/email";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  deviceNumber: string;
  deviceName: string;
}

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [resending, setResending] = useState(false);
  const [pendingUser, setPendingUser] = useState<{ user_id: string; email: string } | null>(null);

  const handleSignUp = async (data: RegisterData) => {
    setLoading(true);
    setError("");

    const signUpData = {
      firstname: data.firstName,
      lastname: data.lastName,
      email: data.email,
      password: data.password,
      device_number: data.deviceNumber,
      device_name: data.deviceName,
    };

    const { data: result, error } = await signUpWithEmail(signUpData);

    if (error) {
      setError(error.message || "Registration failed");
      Alert.alert("Error", error.message || "Registration failed");
      setLoading(false);
      return;
    }

    if (result?.user && result.user.email) {
      try {
        const { error: emailError } = await sendVerificationEmail({
          user_id: result.user.id,
          email: result.user.email,
        });

        if (emailError) {
          throw new Error(emailError);
        }

        Alert.alert(
          "Email Verification Required",
          "We've sent a verification link to your email. Please check your inbox and verify your account before signing in.",
          [
            {
              text: "OK",
              onPress: () => {
                setIsSignUp(false); // Switch back to login form
              },
            },
          ]
        );
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        Alert.alert(
          "Error",
          "Account created but failed to send verification email. Please contact support."
        );
      }
    }

    setLoading(false);
  };

  const handleSignIn = async (data: LoginData) => {
    setLoading(true);
    setError("");
    const { data: loginResult, error } = await signInWithEmail(data);
    if (error) {
      setError(error.message || "Login failed");
      Alert.alert(error.message);
      setLoading(false);
      return;
    }
    // Check if user is_verified
    if (loginResult && loginResult.user && loginResult.user.id) {
      try {
        const { data: profile, error: profileError } = await (
          await import("../lib/supabase")
        ).supabase
          .from("profiles")
          .select("id, email, is_verified")
          .eq("id", loginResult.user.id)
          .single();
        if (profileError || !profile) {
          setError("Could not fetch user profile");
          setLoading(false);
          return;
        }
        if (!profile.is_verified) {
          setPendingUser({ user_id: profile.id, email: profile.email });
          setShowVerifyModal(true);
          setLoading(false);
          return;
        }
      } catch {
        setError("Error checking verification status");
        setLoading(false);
        return;
      }
    }
    setLoading(false);
  };
  const handleResendVerification = async () => {
    if (!pendingUser) return;
    setResending(true);
    try {
      const { error: emailError } = await sendVerificationEmail({
        user_id: pendingUser.user_id,
        email: pendingUser.email,
      });
      if (emailError) {
        throw new Error(emailError);
      }
      Alert.alert(
        "Verification Email Sent",
        "Please check your email for the new verification link."
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to resend verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
    setError("");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: swimTheme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          {isSignUp ? (
            <RegisterForm onSubmit={handleSignUp} error={error} loading={loading} />
          ) : (
            <LoginForm onSubmit={handleSignIn} error={error} loading={loading} />
          )}
          <Button
            mode="text"
            onPress={handleSwitchMode}
            style={styles.switchModeButton}
            labelStyle={styles.switchModeLabel}
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </Button>
        </View>
        {/* Email Verification Modal using react-native-paper */}
        <Portal>
          <PaperModal
            visible={showVerifyModal}
            onDismiss={() => setShowVerifyModal(false)}
            contentContainerStyle={styles.paperModalContent}
          >
            <Text style={styles.modalTitle}>Email Verification Required</Text>
            <Text style={styles.modalMessage}>
              We&apos;ve sent a verification link to your email. Please check your inbox and verify
              your account before signing in.
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
                {resending ? "Sending..." : "Resend Email Verification"}
              </Button>
              <Button
                mode="text"
                onPress={() => setShowVerifyModal(false)}
                style={styles.closeButton}
                labelStyle={styles.closeButtonLabel}
              >
                Close
              </Button>
            </View>
          </PaperModal>
        </Portal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: swimTheme.colors.background,
  },
  content: {
    marginHorizontal: 24,
    padding: 0,
  },
  switchModeButton: {
    marginTop: 8,
    alignSelf: "center",
  },
  switchModeLabel: {
    color: swimTheme.colors.primary,
  },
  // Modal styles for react-native-paper
  paperModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 28,
    width: "85%",
    alignSelf: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: swimTheme.colors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    gap: 16,
    alignItems: "center",
    width: "100%",
    marginTop: 8,
  },
  button: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 0,
    minWidth: 240, // Increased minWidth for longer text
    alignSelf: "center",
    backgroundColor: swimTheme.colors.primary,
    borderRadius: 32,
    height: 48, // Slightly increased height for better fit
    justifyContent: "center", // Center text vertically
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonLabel: {
    color: swimTheme.colors.card,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
    flexShrink: 1, // Allow text to shrink if needed
    flexWrap: "wrap", // Allow text to wrap to next line if needed
  },
  buttonContent: {
    height: 48, // Match button height
    paddingHorizontal: 8, // Add horizontal padding for text
  },
  closeButton: {
    marginTop: 0,
    alignSelf: "center",
  },
  closeButtonLabel: {
    color: swimTheme.colors.primary,
    fontWeight: "600",
    fontSize: 15,
  },
});

export default Auth;
