import {
  ImageBackground,
  ImageStyle,
  ImageSourcePropType,
  Platform,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";

import { colors } from "../theme/colors";

const webImageStyle: ImageStyle & { objectPosition: string } = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "50% 50%",
};

const responsiveWebImageStyle: ImageStyle & { objectPosition: string } = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "50% 61%",
};

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
  const usesResponsiveWeb = Platform.OS === "web" && responsiveWeb;
  const isDesktopWeb = usesResponsiveWeb && width >= 1024;

  return (
    <View style={[styles.card, style]}>
      <ImageBackground
        source={imageSource}
        resizeMode="cover"
        style={styles.image}
        imageStyle={[
          styles.imageRadius,
          usesResponsiveWeb ? styles.responsiveWebImage : Platform.OS === "web" ? styles.imageWeb : null,
        ]}
        accessibilityIgnoresInvertColors
      >
        <View style={[styles.overlay, usesResponsiveWeb && styles.responsiveWebOverlay, isDesktopWeb && styles.responsiveWebOverlayDesktop, overlayStyle]}>
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
  imageWeb: webImageStyle,
  responsiveWebImage: responsiveWebImageStyle,
  overlay: {
    backgroundColor: "rgba(11,31,58,0.68)",
    minHeight: 156,
  },
  responsiveWebOverlay: {
    backgroundColor: "rgba(11,31,58,0.61)",
    minHeight: 200,
  },
  responsiveWebOverlayDesktop: {
    minHeight: 240,
  },
});
