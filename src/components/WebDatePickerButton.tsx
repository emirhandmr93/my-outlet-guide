import { createElement, useRef } from "react";
import { StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

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
    if (typeof input.showPicker === "function") input.showPicker();
    else input.click();
  };

  return <>
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
      style: { position: "fixed", width: 1, height: 1, left: 0, top: 0, opacity: 0, pointerEvents: "none" },
    })}
  </>;
}
