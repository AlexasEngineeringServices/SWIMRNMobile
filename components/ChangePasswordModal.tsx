import { swimTheme } from "@/hooks/useCustomTheme";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { DimensionValue, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { Button, IconButton, Modal, Portal, Text, TextInput } from "react-native-paper";
import { z } from "zod";

import { updatePasswordUser } from "@/services/passwordResetService";

export interface ChangePasswordModalProps {
  visible: boolean;
  onDismiss: () => void;
  user: {
    id: string;
    [key: string]: any;
  } | null;
}

export function ChangePasswordModal({ visible, onDismiss, user }: ChangePasswordModalProps) {
  const [changePasswordError, setChangePasswordError] = React.useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const changePasswordSchema = z
    .object({
      password: z.string().min(6, { message: "Password must be at least 6 characters" }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (visible) {
      reset();
      setChangePasswordError(null);
      setChangePasswordSuccess(null);
    }
  }, [visible, reset]);

  const onChangePassword = async (data: { password: string; confirmPassword: string }) => {
    setChangePasswordError(null);
    setChangePasswordSuccess(null);
    if (!user?.id) {
      setChangePasswordError("User not found.");
      return;
    }
    try {
      const { error: updateError } = await updatePasswordUser(user.id, data.password);
      if (updateError) {
        setChangePasswordError(updateError);
      } else {
        setChangePasswordSuccess("Password changed successfully.");
        setTimeout(onDismiss, 1200);
      }
    } catch (err: any) {
      setChangePasswordError(err.message || "Failed to change password.");
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <View style={styles.modalInnerWrap}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <IconButton icon="close" size={24} onPress={onDismiss} />
          </View>
          <View style={styles.modalContent}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="New Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showPassword}
                  mode="outlined"
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  error={!!errors.password}
                  outlineColor={swimTheme.colors.primary}
                  activeOutlineColor={swimTheme.colors.primary}
                />
              )}
            />
            {typeof errors.password?.message === "string" && (
              <Text style={styles.error}>{errors.password.message}</Text>
            )}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  label="Confirm New Password"
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showConfirmPassword}
                  mode="outlined"
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? "eye-off" : "eye"}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                  error={!!errors.confirmPassword}
                  outlineColor={swimTheme.colors.primary}
                  activeOutlineColor={swimTheme.colors.primary}
                />
              )}
            />
            {typeof errors.confirmPassword?.message === "string" && (
              <Text style={styles.error}>{errors.confirmPassword.message}</Text>
            )}
            {changePasswordError && <Text style={styles.error}>{changePasswordError}</Text>}
            {changePasswordSuccess && <Text style={styles.success}>{changePasswordSuccess}</Text>}
            <Button
              mode="contained"
              style={styles.button}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
              onPress={handleSubmit(onChangePassword)}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Change Password
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: swimTheme.colors.background,
    margin: 24,
    borderRadius: 24,
    padding: 24,
    alignItems: "center" as ViewStyle["alignItems"],
    justifyContent: "center" as ViewStyle["justifyContent"],
    elevation: 4,
  },
  modalInnerWrap: {
    width: "100%" as DimensionValue,
  },
  modalHeader: {
    flexDirection: "row" as ViewStyle["flexDirection"],
    justifyContent: "space-between" as ViewStyle["justifyContent"],
    alignItems: "center" as ViewStyle["alignItems"],
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as TextStyle["fontWeight"],
    color: swimTheme.colors.text,
  },
  modalContent: {
    width: "100%" as DimensionValue,
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
    color: swimTheme.colors.text,
  },
  error: {
    color: swimTheme.colors.notification,
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center" as TextStyle["textAlign"],
  },
  success: {
    color: swimTheme.colors.primary,
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center" as TextStyle["textAlign"],
  },
  button: {
    marginTop: 16,
    borderRadius: 32,
    backgroundColor: swimTheme.colors.primary,
    height: 48,
    justifyContent: "center" as ViewStyle["justifyContent"],
  },
  buttonLabel: {
    color: swimTheme.colors.card,
    fontWeight: "700" as TextStyle["fontWeight"],
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buttonContent: {
    height: 48,
  },
});
