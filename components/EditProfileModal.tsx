import { swimTheme } from "@/hooks/useCustomTheme";
import { updateUserProfile } from "@/services/profileService";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { DimensionValue, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import { Button, IconButton, Modal, Portal, Text, TextInput } from "react-native-paper";
import { z } from "zod";

export interface EditProfileModalProps {
  visible: boolean;
  onDismiss: () => void;
  user: {
    id: string;
    firstname?: string;
    lastname?: string;
    [key: string]: any;
  } | null;
  setUser: (user: any) => void;
}

export function EditProfileModal({ visible, onDismiss, user, setUser }: EditProfileModalProps) {
  const [editError, setEditError] = React.useState<string | null>(null);
  const [editSuccess, setEditSuccess] = React.useState<string | null>(null);

  const schema = z.object({
    firstname: z.string().min(1, { message: "First name is required" }),
    lastname: z.string().min(1, { message: "Last name is required" }),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
    },
  });

  React.useEffect(() => {
    if (visible) {
      reset({ firstname: user?.firstname || "", lastname: user?.lastname || "" });
      setEditError(null);
      setEditSuccess(null);
    }
  }, [visible, user, reset]);

  const onEditSubmit = async (data: { firstname: string; lastname: string }) => {
    setEditError(null);
    setEditSuccess(null);
    if (!user || !user.id) {
      setEditError("User not found.");
      return;
    }
    try {
      const { error } = await updateUserProfile(user.id, data.firstname, data.lastname);
      if (error) {
        setEditError(error);
      } else {
        setEditSuccess("Profile updated successfully.");
        setUser({ ...user, firstname: data.firstname, lastname: data.lastname, id: user.id });
        setTimeout(onDismiss, 1000);
      }
    } catch (e: any) {
      setEditError(e.message || "Failed to update profile.");
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <View style={styles.modalInnerWrap}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <IconButton icon="close" size={24} onPress={onDismiss} />
          </View>
          <View style={styles.modalContent}>
            <Controller
              control={control}
              name="firstname"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="First Name"
                  mode="outlined"
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  outlineColor={swimTheme.colors.primary}
                  activeOutlineColor={swimTheme.colors.primary}
                  error={!!errors.firstname}
                />
              )}
            />
            {typeof errors.firstname?.message === "string" && (
              <Text style={styles.error}>{errors.firstname.message}</Text>
            )}
            <Controller
              control={control}
              name="lastname"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Last Name"
                  mode="outlined"
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  outlineColor={swimTheme.colors.primary}
                  activeOutlineColor={swimTheme.colors.primary}
                  error={!!errors.lastname}
                />
              )}
            />
            {typeof errors.lastname?.message === "string" && (
              <Text style={styles.error}>{errors.lastname.message}</Text>
            )}
            {editError && <Text style={styles.error}>{editError}</Text>}
            {editSuccess && <Text style={styles.success}>{editSuccess}</Text>}
            <Button
              mode="contained"
              style={styles.button}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
              onPress={handleSubmit(onEditSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Save Changes
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
