import React, { useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { swimTheme } from "../hooks/useCustomTheme";
import DeviceActionSwipeGesture from "./DeviceActionSwipeGesture";

interface DeviceActionCardProps {
  deviceNumber: string;
  deviceName: string;
  onEdit: () => void;
  onDelete: () => void;
  onSwipeLeft?: () => void;
}

const CARD_WIDTH = 340;
const MENU_WIDTH = 100;

export const DeviceActionCard: React.FC<DeviceActionCardProps> = ({
  deviceNumber,
  deviceName,
  onEdit,
  onDelete,
  onSwipeLeft,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSwipe = (direction: string) => {
    if (direction === "left" && !menuVisible) {
      Animated.timing(translateX, {
        toValue: -MENU_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setMenuVisible(true);
        if (typeof onSwipeLeft === "function") onSwipeLeft();
      });
    }
  };

  return (
    <DeviceActionSwipeGesture
      menuVisible={menuVisible}
      setMenuVisible={setMenuVisible}
      translateX={translateX}
      onSwipePerformed={handleSwipe}
      gestureStyle={{}}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.card, { transform: [{ translateX }] }]}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.deviceNumber}>Device Number: {deviceNumber}</Text>
              <Text style={styles.deviceName}>Device Name: {deviceName}</Text>
            </View>
          </View>
        </Animated.View>
        {menuVisible && (
          <View style={styles.menuContainer}>
            <Button
              mode="contained"
              style={[styles.menuBtn, { backgroundColor: swimTheme.colors.primary }]}
              icon="pencil"
              onPress={onEdit}
            >
              Edit
            </Button>
            <Button
              mode="contained"
              style={[styles.menuBtn, { backgroundColor: swimTheme.colors.notification }]}
              icon="delete"
              onPress={onDelete}
            >
              Delete
            </Button>
          </View>
        )}
      </View>
    </DeviceActionSwipeGesture>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    alignSelf: "center",
    marginBottom: 16,
    position: "relative",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderTopWidth: 8,
    borderTopColor: swimTheme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    width: CARD_WIDTH,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  deviceNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: swimTheme.colors.text,
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 16,
    color: swimTheme.colors.primary,
  },
  menuContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    height: "100%",
    width: CARD_WIDTH ? CARD_WIDTH - 80 : 240,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 2,
    backgroundColor: "#fff",
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 8,
    borderTopColor: swimTheme.colors.primary,
    paddingVertical: 12,
    paddingRight: 16,
    gap: 8,
  },
  menuBtn: {
    minWidth: 80,
    marginHorizontal: 4,
    borderRadius: 8,
  },
});

export default DeviceActionCard;
