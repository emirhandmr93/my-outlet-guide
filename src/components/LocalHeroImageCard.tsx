import { ImageBackground, ImageSourcePropType, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { colors } from "../theme/colors";

export function LocalHeroImageCard({
  children,
  imageSource,
  contentStyle,
  overlayStyle,
  style,
}: {
  children: React.ReactNode;
  imageSource: ImageSourcePropType;
  contentStyle?: StyleProp<ViewStyle>;
  overlayStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, style]}>
      <ImageBackground
        source={imageSource}
        resizeMode="cover"
        style={styles.image}
        imageStyle={styles.imageRadius}
        accessibilityIgnoresInvertColors
      >
        <View style={[styles.overlay, overlayStyle]}>
          <View style={contentStyle}>{children}</View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    overflow: "hidden",
  },
  image: {
    width: "100%",
  },
  imageRadius: {
    borderRadius: 30,
  },
  overlay: {
    backgroundColor: "rgba(11,31,58,0.68)",
    minHeight: 156,
  },
});
