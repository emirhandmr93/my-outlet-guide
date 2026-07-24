import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  Platform,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";

import { colors } from "../theme/colors";

export function LocalHeroImageCard({
  children,
  imageSource,
  contentStyle,
  overlayStyle,
  responsiveWeb,
  style,
}: {
  children: React.ReactNode;
  imageSource: ImageSourcePropType;
  contentStyle?: StyleProp<ViewStyle>;
  overlayStyle?: StyleProp<ViewStyle>;
  responsiveWeb?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { width } = useWindowDimensions();
  const isDesktopResponsiveWeb =
    Platform.OS === "web" && responsiveWeb && width >= 1024;
  const content = (
    <View
      style={[
        styles.overlay,
        isDesktopResponsiveWeb && styles.responsiveWebOverlay,
        overlayStyle,
      ]}
    >
      <View style={contentStyle}>{children}</View>
    </View>
  );

  return (
    <View style={[styles.card, style]}>
      {isDesktopResponsiveWeb ? (
        <>
          <Image
            source={imageSource}
            resizeMode="cover"
            style={styles.desktopWebImage}
            accessibilityIgnoresInvertColors
          />
          {content}
        </>
      ) : (
        <ImageBackground
          source={imageSource}
          resizeMode="cover"
          style={styles.image}
          imageStyle={styles.imageRadius}
          accessibilityIgnoresInvertColors
        >
          {content}
        </ImageBackground>
      )}
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
  desktopWebImage: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.12 }, { translateY: -12 }],
  },
  overlay: {
    backgroundColor: "rgba(11,31,58,0.68)",
    minHeight: 156,
  },
  responsiveWebOverlay: {
    backgroundColor: "rgba(11,31,58,0.61)",
    minHeight: 240,
  },
});
