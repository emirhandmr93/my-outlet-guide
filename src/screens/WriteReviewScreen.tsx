import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useReviews } from "../contexts/ReviewsContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import { calculateOverallRating, isFirestorePermissionDenied, REVIEW_CATEGORY_KEYS } from "../services/reviewsRatingsService";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import type { ReviewCategoryRatings } from "../types/review";
import { requireAuth } from "../utils/requireAuth";

type RouteParams = { WriteReview: { outletId: string; reviewId?: string } };
type DraftCategoryRatings = Partial<ReviewCategoryRatings>;

export function WriteReviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, "WriteReview">>();
  const { t } = useTranslation();
  const { currentUser, isLoggedIn } = useUser();
  const { reviews, createOrUpdateReview, getLatestActiveReviewForUser } = useReviews();
  const outletId = route.params?.outletId;
  const existingReview = useMemo(
    () => reviews.find((review) => review.outletId === outletId && review.userId === currentUser?.userId),
    [reviews, outletId, currentUser?.userId],
  );
  const [categoryRatings, setCategoryRatings] = useState<DraftCategoryRatings>(() => ({
    transportation: existingReview?.categoryRatings?.transportation,
    brands: existingReview?.categoryRatings?.brands,
    restaurants: existingReview?.categoryRatings?.restaurants,
    services: existingReview?.categoryRatings?.services,
  }));
  const [title, setTitle] = useState(existingReview?.title || "");
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  function scrollFocusedInputIntoView(offset: number) {
    requestAnimationFrame(() => {
      setTimeout(() => scrollRef.current?.scrollTo({ y: offset, animated: true }), 80);
    });
  }

  useEffect(() => {
    let active = true;
    async function loadExistingReview() {
      if (!outletId || !currentUser?.userId) return;
      const review = existingReview || (await getLatestActiveReviewForUser(outletId, currentUser.userId));
      if (!active || !review) return;
      setCategoryRatings({
        transportation: review.categoryRatings?.transportation,
        brands: review.categoryRatings?.brands,
        restaurants: review.categoryRatings?.restaurants,
        services: review.categoryRatings?.services,
      });
      setTitle(review.title || "");
      setComment(review.comment || "");
    }
    loadExistingReview().catch(() => undefined);
    return () => {
      active = false;
    };
  }, [currentUser?.userId, existingReview, getLatestActiveReviewForUser, outletId]);
  const allCategoryRatingsSelected = REVIEW_CATEGORY_KEYS.every((key) => isSelectedRating(categoryRatings[key]));
  const overallRating = allCategoryRatingsSelected ? calculateOverallRating(categoryRatings as ReviewCategoryRatings) : 0;

  function updateCategoryRating(category: keyof ReviewCategoryRatings, rating: number) {
    setCategoryRatings((current) => ({ ...current, [category]: rating }));
  }

  async function saveReview() {
    if (!requireAuth({ isLoggedIn, navigation }) || !currentUser || !outletId) return;
    if (!allCategoryRatingsSelected) {
      Alert.alert(t("writeReview.validationTitle"), t("writeReview.categoryRatingsRequired"));
      return;
    }
    const completeCategoryRatings = categoryRatings as ReviewCategoryRatings;
    const computedRating = calculateOverallRating(completeCategoryRatings);
    try {
      setSaving(true);
      await createOrUpdateReview({
        outletId,
        userId: currentUser.userId,
        userDisplayName: currentUser.name,
        rating: computedRating,
        overallRating: computedRating,
        categoryRatings: completeCategoryRatings,
        title: title.trim(),
        comment: comment.trim(),
      });
      navigation.navigate("OutletDetail", { outletId, reviewsRefresh: Date.now() });
    } catch (error) {

      Alert.alert(
        t("writeReview.saveErrorTitle"),
        error instanceof Error && error.message === "review-hidden-by-moderation"
          ? t("writeReview.hiddenByModeration")
          : isFirestorePermissionDenied(error) ? t("writeReview.savePermissionErrorText") : t("writeReview.saveErrorText"),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}>
      <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.title}>{existingReview ? t("writeReview.editTitle") : t("writeReview.title")}</Text>
        <Text style={styles.helperText}>{t("writeReview.commentOptional")}</Text>
        <Text style={styles.label}>{t("writeReview.categoryRatingsTitle")}</Text>
        {REVIEW_CATEGORY_KEYS.map((category) => (
          <RatingRow
            key={category}
            label={t(`writeReview.categories.${category}`)}
            value={categoryRatings[category] || 0}
            onChange={(rating) => updateCategoryRating(category, rating)}
          />
        ))}
        <View style={styles.derivedRatingBox}>
          <Text style={styles.derivedRatingLabel}>{t("writeReview.overallRatingLabel")}</Text>
          <Text style={styles.derivedRatingValue}>⭐ {overallRating ? overallRating.toFixed(1).replace(/\.0$/, "") : "—"}</Text>
        </View>
        <Text style={styles.label}>{t("writeReview.titleLabel")}</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} maxLength={80} placeholder={t("writeReview.titlePlaceholder")} returnKeyType="next" onFocus={() => scrollFocusedInputIntoView(420)} />
        <Text style={styles.label}>{t("writeReview.commentLabel")}</Text>
        <TextInput style={[styles.input, styles.commentInput]} value={comment} onChangeText={setComment} multiline maxLength={1200} placeholder={t("writeReview.commentPlaceholder")} textAlignVertical="top" onFocus={() => scrollFocusedInputIntoView(560)} />
        <TouchableOpacity style={styles.button} activeOpacity={0.86} onPress={saveReview} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? t("common.loading") : t("writeReview.submit")}</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function isSelectedRating(value: unknown): value is number {
  return typeof value === "number" && value >= 1 && value <= 5;
}

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (rating: number) => void }) {
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingRowLabel}>{label}</Text>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onChange(star)}>
            <Text style={[styles.star, star <= value && styles.starActive]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 72, paddingBottom: 280 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  title: { color: colors.textPrimary, fontSize: typography.h2, fontWeight: "900", marginBottom: spacing.sm },
  helperText: { color: colors.textSecondary, fontSize: typography.small, fontWeight: "700", marginBottom: spacing.md },
  label: { color: colors.textPrimary, fontSize: typography.body, fontWeight: "900", marginTop: spacing.md, marginBottom: spacing.sm },
  ratingRow: { marginBottom: spacing.sm },
  ratingRowLabel: { color: colors.textPrimary, fontSize: typography.body, fontWeight: "800", marginBottom: spacing.xs },
  starRow: { flexDirection: "row", gap: 8 },
  star: { color: colors.border, fontSize: 34 },
  starActive: { color: colors.gold },
  derivedRatingBox: { backgroundColor: colors.surfaceSoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginTop: spacing.md },
  derivedRatingLabel: { color: colors.textSecondary, fontSize: typography.small, fontWeight: "900" },
  derivedRatingValue: { color: colors.textPrimary, fontSize: typography.h3, fontWeight: "900", marginTop: spacing.xs },
  input: { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, color: colors.textPrimary },
  commentInput: { minHeight: 180, textAlignVertical: "top" },
  button: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginTop: spacing.lg, alignItems: "center" },
  buttonText: { color: colors.textInverse, fontSize: typography.body, fontWeight: "900" },
});
