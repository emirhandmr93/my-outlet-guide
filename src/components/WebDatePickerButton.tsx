import { createElement, useRef } from "react";
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

import { formatIsoDateOnly, parseIsoDateOnly } from "../utils/dateOnly";

export function WebDatePickerButton({
  accessibilityLabel,
  value,
  placeholder,
  minimumDate,
  maximumDate,
  onChange,
  style,
  textStyle,
  placeholderStyle,
}: {
  accessibilityLabel: string;
  value: string;
  placeholder: string;
  minimumDate?: string;
  maximumDate?: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  placeholderStyle?: StyleProp<TextStyle>;
}) {
  const inputRef = useRef<any>(null);
  const displayValue = formatIsoDateOnly(value);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        // Continue to compatibility fallback.
      }
    }

    try {
      input.click();
    } catch {
      // Leave the control safely unchanged.
    }
  };

  return <View style={{ position: "relative", width: "100%" }}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={openPicker} style={style}>
      <Text style={displayValue ? textStyle : placeholderStyle}>{displayValue || placeholder}</Text>
    </TouchableOpacity>
    {createElement("input", {
      ref: inputRef,
      type: "date",
      value,
      min: minimumDate,
      max: maximumDate,
      tabIndex: -1,
      "aria-hidden": true,
      onChange: (event: any) => {
        const next = event.target.value;
        if (parseIsoDateOnly(next)) onChange(next);
        event.target.blur();
      },
      style: { position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, pointerEvents: "none" },
    })}
  </View>;
}
