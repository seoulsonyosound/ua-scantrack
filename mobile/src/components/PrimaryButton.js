import React from "react";
import { Pressable, Text } from "react-native";

export function PrimaryButton({ title, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? "#9ca3af" : "#111827",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white", fontWeight: "600" }}>{title}</Text>
    </Pressable>
  );
}