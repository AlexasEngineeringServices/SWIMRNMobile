import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
} from "react-native";

interface SwipeGestureProps {
  gestureStyle?: any;
  children?: React.ReactNode;
  onSwipePerformed: (direction: string) => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

const SwipeGesture = (props: SwipeGestureProps) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Reset position when component mounts or updates
    pan.setValue({ x: 0, y: 0 });
    fadeAnim.setValue(1);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Only allow horizontal movement
        pan.setValue({ x: gestureState.dx, y: 0 });

        // Fade out as the card is swiped
        const opacity = Math.max(1 - Math.abs(gestureState.dx) / (SCREEN_WIDTH * 0.5), 0.5);
        fadeAnim.setValue(opacity);
      },
      onPanResponderRelease: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const x = gestureState.dx;
        if (Math.abs(x) >= SWIPE_THRESHOLD) {
          // Swipe exceeded threshold
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: x > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH, y: 0 },
              useNativeDriver: false,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start(() => {
            props.onSwipePerformed(x > 0 ? "right" : "left");
            // Reset position after animation
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

export default SwipeGesture;
