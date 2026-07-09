import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getImageSource, type OutletMediaImage } from "../media/outletMedia";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type OutletHeroProps = {
  name: string;
  location: string;
  selectedImage?: OutletMediaImage | null;
  galleryImages: OutletMediaImage[];
  favoriteButtonText?: string;
  onPressHeroImage: () => void;
  onPressGalleryImage: (image: OutletMediaImage) => void;
  onPressFavorite?: () => void;
};

export function OutletHero({
  name,
  location,
  selectedImage,
  galleryImages,
  onPressHeroImage,
  onPressGalleryImage,
}: OutletHeroProps) {
  const hasSelectedImage = Boolean(selectedImage);
  const images =
    galleryImages.length > 0
      ? galleryImages
      : selectedImage
        ? [selectedImage]
        : [];

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={hasSelectedImage ? 0.9 : 1}
        disabled={!hasSelectedImage}
        onPress={onPressHeroImage}
        accessibilityRole="imagebutton"
        accessibilityLabel={`${name} gallery hero image`}
      >
        <View style={styles.heroWrap}>
          {selectedImage ? (
            <Image
              source={getImageSource(selectedImage)}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImagePlaceholder}>
              <Text style={styles.noImageIcon}>🛍️</Text>
            </View>
          )}
          <View style={styles.overlay} />

          <View style={styles.kickerPill}>
            <Text style={styles.kickerText}>PREMIUM OUTLET</Text>
          </View>

          <View style={styles.heroTextBlock}>
            <Text style={styles.title}>{name}</Text>
            <Text style={styles.location}>{location}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {images.length > 1 ? (
        <FlatList
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `${item}-${index}`}
          contentContainerStyle={styles.galleryContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => onPressGalleryImage(item)}
              accessibilityRole="imagebutton"
              accessibilityLabel={`${name} gallery thumbnail`}
            >
              <Image
                source={getImageSource(item)}
                style={[
                  styles.galleryImage,
                  selectedImage === item && styles.galleryImageActive,
                ]}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },

  heroWrap: {
    minHeight: 318,
    borderRadius: radius.hero,
    overflow: "hidden",
    backgroundColor: colors.primary,
  },

  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },

  noImagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  noImageIcon: {
    fontSize: 48,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11,31,58,0.52)",
  },

  kickerPill: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  kickerText: {
    color: colors.gold,
    fontSize: typography.small,
    fontWeight: typography.weightBlack,
    flexShrink: 1,
    letterSpacing: 1.2,
  },

  heroTextBlock: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    maxWidth: "92%",
  },

  title: {
    color: colors.textInverse,
    fontSize: typography.h1,
    lineHeight: typography.lineH1,
    fontWeight: typography.weightBlack,
    flexShrink: 1,
    letterSpacing: -0.8,
    flexWrap: "wrap",
  },

  location: {
    color: colors.textInverse,
    fontSize: typography.bodyLarge,
    fontWeight: typography.weightBlack,
    lineHeight: typography.lineBody,
    flexShrink: 1,
    flexWrap: "wrap",
    marginTop: spacing.xs,
  },

  galleryContent: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingRight: spacing.xl,
  },

  galleryImage: {
    width: 92,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 2,
    borderColor: "transparent",
  },

  galleryImageActive: {
    borderColor: colors.gold,
  },
});
