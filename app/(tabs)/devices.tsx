import moment from "moment";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Button, Card, Divider, IconButton, Text, TextInput } from "react-native-paper";
import { swimTheme } from "../../hooks/useCustomTheme";
import {
  addDevice,
  deleteDevice,
  Device,
  editDevice,
  fetchDevices,
} from "../../services/deviceService";
import { useAuthStore } from "../../store/authStore";

export default function DevicesScreen() {
  const { user } = useAuthStore();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [addName, setAddName] = useState("");
  const [addNumber, setAddNumber] = useState("");

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

  // Add device
  const handleAddDevice = async () => {
    if (!addName || !addNumber || !user?.id) return;
    setLoading(true);
    try {
      await addDevice(user.id, addName, addNumber);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
    setAddName("");
    setAddNumber("");
    loadDevices();
  };

  // Edit device
  const handleEditDevice = async (id: string) => {
    if (!editName || !editNumber) return;
    setLoading(true);
    try {
      await editDevice(id, editName, editNumber);
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

  // Render device card
  const renderItem = ({ item }: { item: Device }) => (
    <Card style={styles.card}>
      <Card.Content>
        {editingId === item.id ? (
          <View>
            <TextInput
              label="Device Name"
              value={editName}
              onChangeText={setEditName}
              style={styles.input}
            />
            <TextInput
              label="Device Number"
              value={editNumber}
              onChangeText={setEditNumber}
              style={styles.input}
            />
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
          <View style={styles.deviceRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.deviceName}>{item.device_name}</Text>
              <Text style={styles.deviceNumber}>{item.device_number}</Text>
              <Text style={styles.createdAt}>
                {moment.utc(item.created_at).format("MMM DD, YYYY HH:mm")}
              </Text>
            </View>
            <IconButton
              icon="pencil"
              size={24}
              onPress={() => {
                setEditingId(item.id);
                setEditName(item.device_name);
                setEditNumber(item.device_number);
              }}
            />
            <IconButton icon="delete" size={24} onPress={() => handleDeleteDevice(item.id)} />
          </View>
        )}
      </Card.Content>
    </Card>
  );

  // Skeleton loader for device cards
  const renderSkeleton = () => (
    <>
      {[...Array(3)].map((_, idx) => (
        <Card key={idx} style={styles.card}>
          <Card.Content>
            <View
              style={{
                height: 18,
                width: 120,
                backgroundColor: swimTheme.colors.border,
                borderRadius: 8,
                marginBottom: 12,
                opacity: 0.5,
              }}
            />
            <View
              style={{
                height: 14,
                width: 180,
                backgroundColor: swimTheme.colors.border,
                borderRadius: 8,
                marginBottom: 8,
                opacity: 0.4,
              }}
            />
            <View
              style={{
                height: 14,
                width: 140,
                backgroundColor: swimTheme.colors.border,
                borderRadius: 8,
                marginBottom: 8,
                opacity: 0.4,
              }}
            />
          </Card.Content>
        </Card>
      ))}
    </>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Devices</Text>
      <Card style={styles.addCard}>
        <Card.Content>
          <TextInput
            label="Device Name"
            value={addName}
            onChangeText={setAddName}
            style={styles.input}
          />
          <TextInput
            label="Device Number"
            value={addNumber}
            onChangeText={setAddNumber}
            style={styles.input}
          />
          <Button
            mode="contained"
            style={styles.addBtn}
            onPress={handleAddDevice}
            loading={loading}
          >
            Add Device
          </Button>
        </Card.Content>
      </Card>
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
    marginBottom: 16,
    marginHorizontal: 1,
    backgroundColor: swimTheme.colors.card,
    borderRadius: 16,
    elevation: 2,
    overflow: "hidden",
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: swimTheme.colors.text,
  },
  deviceNumber: {
    fontSize: 14,
    color: swimTheme.colors.primary,
    marginBottom: 4,
  },
  createdAt: {
    fontSize: 12,
    color: swimTheme.colors.border,
    marginBottom: 4,
  },
  emptyText: {
    textAlign: "center",
    color: swimTheme.colors.border,
    marginTop: 32,
    fontSize: 16,
  },
});
