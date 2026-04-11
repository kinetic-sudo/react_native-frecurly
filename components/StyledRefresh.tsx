import React from "react";
import { Platform, RefreshControl, RefreshControlProps } from "react-native";

export function StyledRefreshControl(
  props: Omit<RefreshControlProps, "tintColor" | "colors" | "progressBackgroundColor" | "titleColor" | "title">
) {
  return (
    <RefreshControl
      {...props}
      tintColor="#ea7a53"
      colors={["#ea7a53"]}
      progressBackgroundColor="#FEFCE8"
      progressViewOffset={10}
      {...(Platform.OS === "ios"
        ? { title: "Pull to refresh", titleColor: "#ea7a53" }
        : {})}
    />
  );
}