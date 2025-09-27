import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
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

    console.log("Sign-up data:", signUpData);

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
    const { error } = await signInWithEmail(data);
    if (error) {
      setError(error.message || "Login failed");
      Alert.alert(error.message);
    }
    setLoading(false);
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
});

export default Auth;
