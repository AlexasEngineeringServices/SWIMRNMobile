import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    GestureResponderEvent,
    PanResponder,
    PanResponderGestureState,
} from "react-native";

interface DeviceCardSwipeGestureProps {
  gestureStyle?: any;
  children?: React.ReactNode;
  onSwipePerformed: (direction: string) => void;
  allowDirection?: ("left" | "right")[];
}

const SCREEN_WIDTH = Dimensions.get("window").width;
// Reduce threshold to 10% of screen width for more sensitive swipe
const SWIPE_THRESHOLD = 0.1 * SCREEN_WIDTH;

const DeviceCardSwipeGesture = (props: DeviceCardSwipeGestureProps) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Reset position when component mounts or updates
    pan.setValue({ x: 0, y: 0 });
    fadeAnim.setValue(1);
  }, [fadeAnim, pan]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only start responder for mostly-horizontal gestures
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 5;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (evt, gestureState) => {
        // Only allow horizontal movement. If left swipes are not allowed, ignore negative dx.
        let dx = gestureState.dx;
        if (dx < 0 && props.allowDirection && !props.allowDirection.includes("left")) {
          dx = 0;
        }
        pan.setValue({ x: dx, y: 0 });

        // Fade out as the card is swiped (use the effective dx)
        const opacity = Math.max(1 - Math.abs(dx) / (SCREEN_WIDTH * 0.5), 0.5);
        fadeAnim.setValue(opacity);
      },
      onPanResponderRelease: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const x = gestureState.dx;

        // If left swipes are disallowed and the final dx is negative, just snap back.
        if (x < 0 && props.allowDirection && !props.allowDirection.includes("left")) {
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 5,
              useNativeDriver: false,
            }),
            Animated.spring(fadeAnim, {
              toValue: 1,
              friction: 5,
              useNativeDriver: false,
            }),
          ]).start();
          return;
        }

        if (Math.abs(x) >= SWIPE_THRESHOLD) {
          // Swipe exceeded threshold
          const direction = x > 0 ? "right" : "left";
          if (!props.allowDirection || props.allowDirection.includes(direction)) {
            props.onSwipePerformed(direction);
          }
          // Quick reset animation
          Animated.parallel([
            Animated.timing(pan, {
              toValue: { x: 0, y: 0 },
              duration: 150,
              useNativeDriver: false,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: false,
            }),
          ]).start(() => {
            pan.setValue({ x: 0, y: 0 });
            fadeAnim.setValue(1);
          });
        } else {
          // Return to center if swipe didn't exceed threshold
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 5,
              useNativeDriver: false,
            }),
            Animated.spring(fadeAnim, {
              toValue: 1,
              friction: 5,
              useNativeDriver: false,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const animatedStyles = {
    transform: [{ translateX: pan.x }],
    opacity: fadeAnim,
  };

  return (
    <Animated.View {...panResponder.panHandlers} style={[props.gestureStyle, animatedStyles]}>
      {props.children}
    </Animated.View>
  );
};

export default DeviceCardSwipeGesture;
