import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { useReviews } from "../contexts/ReviewsContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { requireAuth } from "../utils/requireAuth";

type RouteParams = { WriteReview: { outletId: string; reviewId?: string } };

export function WriteReviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, "WriteReview">>();
  const { t } = useTranslation();
  const { currentUser, isLoggedIn } = useUser();
  const { reviews, createOrUpdateReview } = useReviews();
  const outletId = route.params?.outletId;
  const existingReview = useMemo(
    () => reviews.find((review) => review.outletId === outletId && review.userId === currentUser?.userId),
    [reviews, outletId, currentUser?.userId],
  );
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [saving, setSaving] = useState(false);

  async function saveReview() {
    if (!requireAuth({ isLoggedIn, navigation }) || !currentUser || !outletId) return;
    if (rating < 1 || rating > 5) {
      Alert.alert(t("writeReview.validationTitle"), t("writeReview.ratingRequired"));
      return;
    }
    if (comment.trim().length < 10) {
      Alert.alert(t("writeReview.validationTitle"), t("writeReview.commentRequired"));
      return;
    }
    try {
      setSaving(true);
      await createOrUpdateReview({
        outletId,
        userId: currentUser.userId,
        userDisplayName: currentUser.name,
        rating,
        title,
        comment,
      });
      navigation.navigate("OutletDetail", { outletId });
    } catch (error) {
      console.log("Review save error", error);
      Alert.alert(t("writeReview.saveErrorTitle"), t("writeReview.saveErrorText"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{existingReview ? t("writeReview.editTitle") : t("writeReview.title")}</Text>
        <Text style={styles.label}>{t("writeReview.ratingLabel")}</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity key={value} onPress={() => setRating(value)}>
              <Text style={[styles.star, value <= rating && styles.starActive]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>{t("writeReview.titleLabel")}</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} maxLength={80} placeholder={t("writeReview.titlePlaceholder")} />
        <Text style={styles.label}>{t("writeReview.commentLabel")}</Text>
        <TextInput style={[styles.input, styles.commentInput]} value={comment} onChangeText={setComment} multiline maxLength={1200} placeholder={t("writeReview.commentPlaceholder")} />
        <TouchableOpacity style={styles.button} activeOpacity={0.86} onPress={saveReview} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? t("common.loading") : t("writeReview.submit")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 72 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  title: { color: colors.textPrimary, fontSize: typography.h2, fontWeight: "900", marginBottom: spacing.lg },
  label: { color: colors.textPrimary, fontSize: typography.body, fontWeight: "900", marginTop: spacing.md, marginBottom: spacing.sm },
  starRow: { flexDirection: "row", gap: 8 },
  star: { color: colors.border, fontSize: 34 },
  starActive: { color: colors.gold },
  input: { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md, color: colors.textPrimary },
  commentInput: { minHeight: 140, textAlignVertical: "top" },
  button: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginTop: spacing.lg, alignItems: "center" },
  buttonText: { color: colors.textInverse, fontSize: typography.body, fontWeight: "900" },
});
