import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, RefreshControl, RefreshControlProps } from "react-native";

// Custom spinner that actually respects our brand color on iOS
function BrandSpinner({ visible }: { visible: boolean }) {
  const rotation = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      rotation.setValue(0);
    }
  }, [visible]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={{
        opacity,
        position: "absolute",
        top: 16,
        alignSelf: "center",
        zIndex: 10,
      }}
    >
      <Animated.View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          borderWidth: 2.5,
          borderColor: "#ea7a53",
          borderTopColor: "transparent",
          transform: [{ rotate: spin }],
        }}
      />
    </Animated.View>
  );
}

export function StyledRefreshControl(
  props: Omit<RefreshControlProps, "tintColor" | "colors" | "progressBackgroundColor" | "titleColor" | "title">
) {
  // On Android the native colors prop works fine
  if (Platform.OS === "android") {
    return (
      <RefreshControl
        {...props}
        colors={["#ea7a53"]}
        progressBackgroundColor="#FEFCE8"
      />
    );
  }

  // On iOS use native tintColor — works on device, may be grey in simulator
  return (
    <RefreshControl
      {...props}
      tintColor="#ea7a53"
      titleColor="#ea7a53"
      title=" "
    />
  );
}