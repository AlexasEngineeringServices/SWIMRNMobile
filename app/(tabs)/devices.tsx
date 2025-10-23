import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Button, Divider, IconButton, Modal, Portal, Text, TextInput } from "react-native-paper";
import { z } from "zod";
import { DeviceActionCard } from "../../components/DeviceActionCard";
import { swimTheme } from "../../hooks/useCustomTheme";
import { supabase } from "../../lib/supabase";
import {
  addDevice,
  deleteDevice,
  Device,
  editDevice,
  fetchDevices,
} from "../../services/deviceService";
import { useAuthStore } from "../../store/authStore";

export default function DevicesScreen() {
  const [showSwipeTip, setShowSwipeTip] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuthStore();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [formErrors, setFormErrors] = useState<{ edit?: string }>({});
  const [addModalVisible, setAddModalVisible] = useState(false);

  const deviceSchema = z.object({
    deviceNumber: z.string().min(1, { message: "Device number is required" }),
    deviceName: z.string().min(1, { message: "Device name is required" }),
  });

  const devicesArraySchema = z
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
      } catch (_error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Error validating device numbers",
          path: ["devices"],
        });
      }
    });

  const loadDevices = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await fetchDevices(user.id);
      setDevices(data);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // React Hook Form for Multi-Device Add
  const {
    control: addControl,
    handleSubmit: handleAddSubmit,
    formState: { errors: addErrors },
    reset: addReset,
    setError,
  } = useForm({
    resolver: zodResolver(devicesArraySchema),
    defaultValues: { devices: [{ deviceName: "", deviceNumber: "" }] },
    mode: "onSubmit",
  });
  const { fields, append, remove } = useFieldArray({
    control: addControl,
    name: "devices",
  });

  const handleAddDevice = async (data: {
    devices: { deviceName: string; deviceNumber: string }[];
  }) => {
    setLoading(true);
    try {
      if (!user) throw new Error("User not found");

      // Normalize device numbers
      const normalizedDevices = data.devices.map((device) => ({
        ...device,
        deviceNumber: device.deviceNumber.trim().toLowerCase(),
      }));

      // Check for duplicates again before submitting
      const deviceNumbers = normalizedDevices.map((d) => d.deviceNumber);
      const { data: existingDevices } = await supabase
        .from("devices")
        .select("device_number")
        .in("device_number", deviceNumbers);

      if (existingDevices && existingDevices.length > 0) {
        const existingNumbers = existingDevices.map((d) => d.device_number.toLowerCase());
        const duplicateIndex = normalizedDevices.findIndex((d) =>
          existingNumbers.includes(d.deviceNumber)
        );

        if (duplicateIndex !== -1) {
          setError(`devices.${duplicateIndex}.deviceNumber`, {
            type: "manual",
            message: `Device number ${normalizedDevices[duplicateIndex].deviceNumber} is already registered`,
          });
          setLoading(false);
          return;
        }
      }

      // Add devices if validation passes
      for (const device of normalizedDevices) {
        await addDevice(user.id, device.deviceName, device.deviceNumber);
      }

      addReset();
      await loadDevices();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
    setLoading(false);
  };

  // Edit device
  const handleEditDevice = async (id: string) => {
    setFormErrors({});
    // Always use lowercase for device number
    const normalizedNumber = editNumber.trim().toLowerCase();
    const validation = deviceSchema.safeParse({
      deviceNumber: normalizedNumber,
      deviceName: editName,
    });
    if (!validation.success) {
      setFormErrors({ edit: validation.error.issues[0].message });
      return;
    }
    if (!editName || !normalizedNumber) return;
    setLoading(true);
    try {
      await editDevice(id, editName, normalizedNumber);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
    setEditingId(null);
    setEditName("");
    setEditNumber("");
    loadDevices();
  };

  // Delete device
  const handleDeleteDevice = async (id: string) => {
    Alert.alert("Delete Device", "Are you sure you want to delete this device?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await deleteDevice(id);
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
          loadDevices();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Device }) =>
    editingId === item.id ? (
      <View style={styles.card}>
        <TextInput
          label="Device Name"
          value={editName}
          onChangeText={setEditName}
          style={styles.input}
        />
        <TextInput
          label="Device Number"
          value={editNumber}
          onChangeText={(text) => setEditNumber(text.toLowerCase())}
          style={styles.input}
          autoCapitalize="none"
        />
        {formErrors.edit && (
          <Text style={{ color: swimTheme.colors.notification }}>{formErrors.edit}</Text>
        )}
        <Button
          mode="contained"
          style={styles.saveBtn}
          onPress={() => handleEditDevice(item.id)}
          loading={loading}
        >
          Save
        </Button>
        <Button mode="text" onPress={() => setEditingId(null)}>
          Cancel
        </Button>
      </View>
    ) : (
      <DeviceActionCard
        deviceNumber={item.device_number}
        deviceName={item.device_name}
        onEdit={() => {
          setEditingId(item.id);
          setEditName(item.device_name);
          setEditNumber(item.device_number);
        }}
        onDelete={() => handleDeleteDevice(item.id)}
        onSwipeLeft={() => {}}
      />
    );

  // Skeleton loader for device cards
  const renderSkeleton = () => (
    <>
      {[...Array(3)].map((_, idx) => (
        <View key={idx} style={styles.card}>
          <View
            style={{
              height: 24,
              width: 150,
              backgroundColor: swimTheme.colors.border,
              borderRadius: 8,
              marginBottom: 12,
              opacity: 0.5,
            }}
          />
          <View
            style={{
              height: 16,
              width: 200,
              backgroundColor: swimTheme.colors.border,
              borderRadius: 8,
              marginBottom: 8,
              opacity: 0.4,
            }}
          />
          <View
            style={{
              height: 14,
              width: 160,
              backgroundColor: swimTheme.colors.border,
              borderRadius: 8,
              marginBottom: 8,
              opacity: 0.4,
            }}
          />
        </View>
      ))}
    </>
  );

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>My Devices</Text>
        <Button
          mode="contained"
          style={[styles.addBtn, { marginBottom: 16 }]}
          onPress={() => setAddModalVisible(true)}
        >
          Add Device(s)
        </Button>

        <Divider style={styles.divider} />
        {loading ? (
          <View style={{ marginTop: 16 }}>{renderSkeleton()}</View>
        ) : (
          <FlatList
            data={devices}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No devices found.</Text>}
            refreshing={loading}
            onRefresh={loadDevices}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <Portal>
        <Modal
          visible={addModalVisible}
          onDismiss={() => setAddModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalInnerWrap}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Devices</Text>
              <IconButton icon="close" size={24} onPress={() => setAddModalVisible(false)} />
            </View>
            <View style={styles.modalContent}>
              <FlatList
                ref={flatListRef}
                data={fields}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={true}
                persistentScrollbar={true}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      marginBottom: 8,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 8,
                      padding: 12,
                      position: "relative",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{ fontWeight: "600", fontSize: 16, color: swimTheme.colors.text }}
                      >
                        Device {index + 1}
                      </Text>
                      {fields.length > 1 && (
                        <Button
                          mode="text"
                          onPress={() => remove(index)}
                          style={{ marginBottom: 0 }}
                          labelStyle={{ color: swimTheme.colors.notification, fontWeight: "600" }}
                        >
                          Remove
                        </Button>
                      )}
                    </View>
                    <Controller
                      control={addControl}
                      name={`devices.${index}.deviceName`}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          label="Device Name"
                          mode="outlined"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          style={styles.input}
                          outlineColor={swimTheme.colors.primary}
                          activeOutlineColor={swimTheme.colors.primary}
                          error={!!addErrors.devices?.[index]?.deviceName}
                        />
                      )}
                    />
                    {addErrors.devices?.[index]?.deviceName && (
                      <Text style={styles.error}>
                        {addErrors.devices[index].deviceName?.message}
                      </Text>
                    )}
                    <Controller
                      control={addControl}
                      name={`devices.${index}.deviceNumber`}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          label="Device Number"
                          mode="outlined"
                          value={value}
                          onChangeText={(text) => onChange(text.toLowerCase())}
                          onBlur={onBlur}
                          style={styles.input}
                          autoCapitalize="none"
                          outlineColor={swimTheme.colors.primary}
                          activeOutlineColor={swimTheme.colors.primary}
                          error={!!addErrors.devices?.[index]?.deviceNumber}
                        />
                      )}
                    />
                    {addErrors.devices?.[index]?.deviceNumber && (
                      <Text style={styles.error}>
                        {addErrors.devices[index].deviceNumber?.message}
                      </Text>
                    )}
                  </View>
                )}
                ListFooterComponent={
                  <>
                    <Button
                      mode="outlined"
                      onPress={() => {
                        append({ deviceName: "", deviceNumber: "" });
                        // Small delay to ensure the new device is rendered before scrolling
                        setTimeout(() => {
                          if (flatListRef.current) {
                            flatListRef.current.scrollToEnd({ animated: true });
                          }
                        }, 100);
                      }}
                      style={{ marginBottom: 8 }}
                    >
                      Add Another Device
                    </Button>
                    <Button
                      mode="contained"
                      style={styles.addBtn}
                      onPress={handleAddSubmit(async (data) => {
                        await handleAddDevice(data);
                        setAddModalVisible(false);
                      })}
                      loading={loading}
                    >
                      Add Device(s)
                    </Button>
                  </>
                }
              />
            </View>
          </View>
        </Modal>
        {/* Swipe direction tip modal */}
        <Modal
          visible={showSwipeTip}
          onDismiss={() => setShowSwipeTip(false)}
          contentContainerStyle={{
            backgroundColor: "#f6f4fa",
            margin: 24,
            borderRadius: 24,
            padding: 24,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <IconButton
              icon="gesture-swipe-left"
              size={48}
              theme={{ colors: { primary: swimTheme.colors.primary } }}
            />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                marginVertical: 12,
                color: swimTheme.colors.text,
              }}
            >
              Swipe Left & Right
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: swimTheme.colors.text,
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              Swipe left on a device card to reveal the Edit and Delete menu. Otherwise swipe right
              to cancel or hide the edit and delete menu.
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowSwipeTip(false)}
              style={{ borderRadius: 24 }}
            >
              Got it
            </Button>
          </View>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: swimTheme.colors.background,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },

  error: {
    color: swimTheme.colors.notification,
    marginBottom: 12,
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: swimTheme.colors.primary,
    alignSelf: "center",
  },
  addCard: {
    marginBottom: 16,
    backgroundColor: swimTheme.colors.card,
    borderRadius: 16,
    elevation: 2,
    overflow: "hidden",
  },
  input: {
    marginBottom: 12,
    backgroundColor: swimTheme.colors.card,
  },
  addBtn: {
    borderRadius: 8,
    backgroundColor: swimTheme.colors.primary,
  },
  saveBtn: {
    borderRadius: 8,
    backgroundColor: swimTheme.colors.primary,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: swimTheme.colors.border,
    height: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderTopWidth: 8,
    borderTopColor: swimTheme.colors.primary,
  },
  deviceHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  deviceTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: swimTheme.colors.text,
  },
  deviceNameText: {
    fontSize: 16,
    color: swimTheme.colors.primary,
    marginBottom: 4,
  },
  createdAt: {
    fontSize: 14,
    color: swimTheme.colors.border,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: swimTheme.colors.border,
    marginTop: 32,
    fontSize: 16,
  },
  modalContainer: {
    margin: 0,
    justifyContent: "flex-end",
    padding: 0,
  },
  modalInnerWrap: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 16,
    width: "100%",
    height: "100%",
    elevation: 6,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    width: "100%",
    marginBottom: 16,
  },
  modalContent: {
    flex: 1,
    width: "100%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: swimTheme.colors.primary,
    marginBottom: 18,
    alignSelf: "center",
  },
  deviceModalCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    width: "100%",
    elevation: 1,
  },
  deviceModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  deviceModalTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: swimTheme.colors.text,
  },
  deviceModalRemoveBtn: {
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  modalFooterBtns: {
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    color: swimTheme.colors.border,
    marginBottom: 4,
  },
  metricsContainer: {
    marginTop: 12,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metricBox: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 14,
    color: swimTheme.colors.border,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "600",
    color: swimTheme.colors.primary,
  },
  modalAddAnotherBtn: {
    marginBottom: 10,
    width: "100%",
    borderRadius: 8,
    borderColor: swimTheme.colors.primary,
  },
  modalAddBtn: {
    width: "100%",
    borderRadius: 8,
    backgroundColor: swimTheme.colors.primary,
  },
});
