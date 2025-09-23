import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { z } from "zod";
import { FONT_SIZES, LINE_HEIGHTS } from "../constants/theme";
import { swimTheme } from "../hooks/useCustomTheme";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormProps = {
  onSubmit: (data: { email: string; password: string }) => void;
  error?: string;
  loading?: boolean;
};

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, error, loading }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <View>
      <Text style={styles.title}>Welcome Back</Text>
      <Controller
        control={control}
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
            error={!!errors.email}
          />
        )}
      />
      {errors.email && (
        <Text style={styles.error}>{errors.email.message as string}</Text>
      )}
      <Controller
        control={control}
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
            error={!!errors.password}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword((prev) => !prev)}
              />
            }
          />
        )}
      />
      {errors.password && (
        <Text style={styles.error}>{errors.password.message as string}</Text>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        mode="contained"
        style={loading ? [styles.button, styles.buttonDisabled] : styles.button}
        labelStyle={styles.buttonLabel}
        contentStyle={styles.buttonContent}
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        disabled={loading}
      >
        Sign In
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default LoginForm;
