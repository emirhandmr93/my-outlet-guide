import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { useTranslation } from "../hooks/useTranslation";
import { useLayoutDirection } from "../hooks/useLayoutDirection";
import { getImageSource, type OutletMediaImage } from "../media/outletMedia";
import {
  formatCampaignDate,
  subscribeActiveOutletCampaignsForOutlet,
  type OutletCampaign,
} from "../services/outletCampaignService";
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
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t, language } = useTranslation();
  const { width } = useWindowDimensions();
  const { isNativeRTL } = useLayoutDirection();
  const isDesktopWeb = Platform.OS === "web" && width >= 1024;
  const outletId = typeof route.params?.outletId === "string" ? route.params.outletId : "";
  const [activeCampaigns, setActiveCampaigns] = useState<OutletCampaign[]>([]);
  const hasSelectedImage = Boolean(selectedImage);
  const images =
    galleryImages.length > 0
      ? galleryImages
      : selectedImage
        ? [selectedImage]
        : [];
  const campaignCardWidth = Math.min(isDesktopWeb ? 360 : Math.max(260, width - spacing.xl * 3), 360);

  useEffect(() => {
    if (!outletId) {
      setActiveCampaigns([]);
      return;
    }

    return subscribeActiveOutletCampaignsForOutlet(
      outletId,
      setActiveCampaigns,
      () => setActiveCampaigns([]),
      language,
    );
  }, [language, outletId]);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={hasSelectedImage ? 0.9 : 1}
        disabled={!hasSelectedImage}
        onPress={onPressHeroImage}
        accessibilityRole="imagebutton"
        accessibilityLabel={`${name} gallery hero image`}
      >
        <View style={[styles.heroWrap, isDesktopWeb && styles.heroWrapDesktop]}>
          {selectedImage ? (
            isDesktopWeb ? <>
              <Image source={getImageSource(selectedImage)} style={styles.desktopBackgroundImage} resizeMode="cover" blurRadius={8} />
              <Image source={getImageSource(selectedImage)} style={styles.heroImage} resizeMode="contain" />
            </> : <Image source={getImageSource(selectedImage)} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.noImagePlaceholder}>
              <Text style={styles.noImageIcon}>🛍️</Text>
            </View>
          )}
          <View style={styles.overlay} />

          <View style={[styles.kickerPill, isNativeRTL && styles.kickerPillRTL]}>
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

      {activeCampaigns.length > 0 ? (
        <View style={styles.campaignSection}>
          <View style={styles.campaignHeaderRow}>
            <View style={styles.campaignHeaderCopy}>
              <Text style={styles.campaignSectionTitle}>{t("nav.campaign")}</Text>
              <Text style={styles.campaignVerifiedText}>{t("campaign.sourceBody")}</Text>
            </View>
            <View style={styles.campaignCountBadge}>
              <Text style={styles.campaignCountText}>{activeCampaigns.length}</Text>
            </View>
          </View>
          <FlatList
            data={activeCampaigns}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(campaign) => campaign.campaignId}
            contentContainerStyle={styles.campaignList}
            renderItem={({ item: campaign }) => (
              <TouchableOpacity
                activeOpacity={0.86}
                accessibilityRole="button"
                accessibilityLabel={`${campaign.brandName}: ${campaign.headline}`}
                style={[styles.campaignCard, { width: campaignCardWidth }]}
                onPress={() => navigation.navigate("CampaignDetail", { campaignId: campaign.campaignId })}
              >
                <View style={styles.campaignTopRow}>
                  <Text style={styles.campaignDiscount} numberOfLines={2}>{campaign.discountLabel}</Text>
                  <Text style={styles.campaignArrow}>{isNativeRTL ? "←" : "→"}</Text>
                </View>
                <Text style={styles.campaignBrand} numberOfLines={1}>{campaign.brandName}</Text>
                <Text style={styles.campaignHeadline} numberOfLines={2}>{campaign.headline}</Text>
                <Text style={styles.campaignEndDate} numberOfLines={1}>
                  {t("campaign.ends")} {formatCampaignDate(campaign.endsOn, language)}
                </Text>
                <Text style={styles.campaignCta}>{t("campaign.viewCampaign")}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
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
  desktopBackgroundImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%", opacity: 0.45, transform: [{ scale: 1.06 }] },
  heroWrapDesktop: { minHeight: 460 },

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
  kickerPillRTL: {
    left: undefined,
    right: spacing.lg,
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
    paddingEnd: spacing.xl,
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

  campaignSection: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
  },
  campaignHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  campaignHeaderCopy: {
    flex: 1,
  },
  campaignSectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.h3,
    fontWeight: typography.weightBlack,
  },
  campaignVerifiedText: {
    color: colors.textSecondary,
    fontSize: typography.small,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  campaignCountBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
  },
  campaignCountText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: typography.weightBlack,
  },
  campaignList: {
    gap: spacing.sm,
    paddingEnd: spacing.sm,
  },
  campaignCard: {
    minHeight: 176,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.55)",
  },
  campaignTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  campaignDiscount: {
    flex: 1,
    color: colors.gold,
    fontSize: typography.small,
    lineHeight: 18,
    fontWeight: typography.weightBlack,
  },
  campaignArrow: {
    color: colors.gold,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: typography.weightBlack,
  },
  campaignBrand: {
    color: colors.textInverse,
    fontSize: typography.h3,
    fontWeight: typography.weightBlack,
    marginTop: spacing.sm,
  },
  campaignHeadline: {
    color: colors.textInverse,
    fontSize: typography.body,
    lineHeight: 21,
    fontWeight: typography.weightBold,
    marginTop: spacing.xs,
  },
  campaignEndDate: {
    color: "rgba(255,255,255,0.72)",
    fontSize: typography.small,
    marginTop: spacing.sm,
  },
  campaignCta: {
    color: colors.gold,
    fontSize: typography.small,
    fontWeight: typography.weightBlack,
    marginTop: spacing.md,
  },
});