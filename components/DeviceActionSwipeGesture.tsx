import React from "react";
import { Animated } from "react-native";
import SwipeGesture from "./DeviceCardSwipeGesture";

interface DeviceActionSwipeGestureProps {
  menuVisible: boolean;
  setMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
  translateX: Animated.Value;
  onSwipePerformed: (direction: string) => void;
  gestureStyle?: any;
  children: React.ReactNode;
}

const DeviceActionSwipeGesture: React.FC<DeviceActionSwipeGestureProps> = ({
  menuVisible,
  setMenuVisible,
  translateX,
  onSwipePerformed,
  gestureStyle,
  children,
}) => {
  const handleGesture = (direction: string) => {
    if (direction === "right" && menuVisible) {
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setMenuVisible(false);
      });
    } else {
      onSwipePerformed(direction);
    }
  };
  return (
    <SwipeGesture
      key={menuVisible ? "menu-open" : "menu-closed"}
      onSwipePerformed={handleGesture}
      gestureStyle={gestureStyle}
      allowDirection={menuVisible ? ["right", "left"] : ["left"]}
    >
      {children}
    </SwipeGesture>
  );
};

export default DeviceActionSwipeGesture;
