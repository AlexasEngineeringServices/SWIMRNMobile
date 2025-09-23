import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button } from "react-native-paper";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { swimTheme } from "../hooks/useCustomTheme";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError("");
    if (isSignUp) {
      console.log("Sign Up submitted", data);
    } else {
      console.log("Sign In submitted", data);
    }
    // Simulate async
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
    setError("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        {isSignUp ? (
          <RegisterForm onSubmit={handleAuth} error={error} loading={loading} />
        ) : (
          <LoginForm onSubmit={handleAuth} error={error} loading={loading} />
        )}
        <Button
          mode="text"
          onPress={handleSwitchMode}
          style={styles.switchModeButton}
          labelStyle={styles.switchModeLabel}
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Button>
      </View>
    </KeyboardAvoidingView>
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
