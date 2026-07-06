import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import {
ScrollView,
StyleSheet,
Text,
TextInput,
TouchableOpacity,
View,
} from "react-native";

import { outlets } from "../constants/outlets";
import { useReviews } from "../contexts/ReviewsContext";
import { useTranslation } from "../hooks/useTranslation";

type RouteParams = {
WriteReview: {
outletId: string;
reviewId?: string;
};
};

function RatingRow({
title,
value,
onChange,
}: {
title: string;
value: number;
onChange: (rating: number) => void;
}) {
return (
<View style={styles.ratingRow}>
<Text style={styles.ratingTitle}>{title}</Text>

<View style={styles.starsRow}>
{[1, 2, 3, 4, 5].map((star) => (
<TouchableOpacity key={star} onPress={() => onChange(star)}>
<Text style={styles.star}>{star <= value ? "★" : "☆"}</Text>
</TouchableOpacity>
))}
</View>
</View>
);
}

export function WriteReviewScreen() {
const route = useRoute<RouteProp<RouteParams, "WriteReview">>();
const navigation = useNavigation<any>();
const { reviews, addReview, updateReview } = useReviews();
const { t } = useTranslation();
const { currentUser } = useUser();

const outlet =
outlets.find((item) => item.outletId === route.params?.outletId) ||
outlets[0];

const existingReview = reviews.find(
(review) => review.reviewId === route.params?.reviewId
);

const isEditMode = Boolean(existingReview);

const [overallRating, setOverallRating] = useState(
existingReview?.overallRating || 5
);
const [transportationRating, setTransportationRating] = useState(
existingReview?.transportationRating || 5
);
const [brandVarietyRating, setBrandVarietyRating] = useState(
existingReview?.brandVarietyRating || 5
);
const [restaurantsRating, setRestaurantsRating] = useState(
existingReview?.restaurantsRating || 5
);
const [servicesRating, setServicesRating] = useState(
existingReview?.servicesRating || 5
);
const [comment, setComment] = useState(existingReview?.comment || "");

function handleSubmit() {
if (existingReview) {
updateReview(existingReview.reviewId, {
overallRating,
transportationRating,
brandVarietyRating,
restaurantsRating,
servicesRating,
comment,
});
} else {
addReview({
reviewId: `${outlet.outletId}-${Date.now()}`,
outletId: outlet.outletId,
userId: currentUser?.userId,
userName: currentUser?.name || t("writeReview.defaultUserName"),
overallRating,
transportationRating,
brandVarietyRating,
restaurantsRating,
servicesRating,
comment,
createdAt: new Date().toISOString().slice(0, 10),
isEdited: false,
});
}

navigation.goBack();
}

return (
<ScrollView style={styles.container} contentContainerStyle={styles.content}>
<Text style={styles.pageTitle}>
{isEditMode ? t("writeReview.editTitle") : t("writeReview.title")}
</Text>

<Text style={styles.pageSubtitle}>{outlet.name}</Text>

<View style={styles.card}>
<RatingRow
title={t("writeReview.overall")}
value={overallRating}
onChange={setOverallRating}
/>

<RatingRow
title={t("writeReview.transportation")}
value={transportationRating}
onChange={setTransportationRating}
/>

<RatingRow
title={t("writeReview.brandVariety")}
value={brandVarietyRating}
onChange={setBrandVarietyRating}
/>

<RatingRow
title={t("writeReview.restaurants")}
value={restaurantsRating}
onChange={setRestaurantsRating}
/>

<RatingRow
title={t("writeReview.services")}
value={servicesRating}
onChange={setServicesRating}
/>

<Text style={styles.label}>{t("writeReview.comment")}</Text>

<TextInput
style={styles.input}
placeholder={t("writeReview.placeholder")}
placeholderTextColor="#8A8A8A"
value={comment}
onChangeText={setComment}
multiline
/>

<TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
<Text style={styles.submitButtonText}>
{isEditMode ? t("writeReview.update") : t("writeReview.submit")}
</Text>
</TouchableOpacity>

<Text style={styles.note}>{t("writeReview.note")}</Text>
</View>
</ScrollView>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: "#F7F8FA" },
content: { padding: 20, paddingTop: 60, paddingBottom: 120 },

pageTitle: {
fontSize: 28,
fontWeight: "800",
color: "#0B1F3A",
},

pageSubtitle: {
fontSize: 15,
color: "#C9A227",
marginTop: 6,
marginBottom: 22,
},

card: {
backgroundColor: "#FFFFFF",
borderRadius: 20,
padding: 18,
borderWidth: 1,
borderColor: "#E5E7EB",
},

ratingRow: {
marginBottom: 18,
},

ratingTitle: {
fontSize: 16,
fontWeight: "800",
color: "#0B1F3A",
marginBottom: 8,
},

starsRow: {
flexDirection: "row",
gap: 6,
},

star: {
fontSize: 30,
color: "#C9A227",
},

label: {
fontSize: 16,
fontWeight: "800",
color: "#0B1F3A",
marginTop: 8,
marginBottom: 8,
},

input: {
minHeight: 120,
backgroundColor: "#F7F8FA",
borderRadius: 16,
padding: 14,
borderWidth: 1,
borderColor: "#E5E7EB",
fontSize: 15,
color: "#0B1F3A",
textAlignVertical: "top",
},

submitButton: {
backgroundColor: "#0B1F3A",
borderRadius: 14,
padding: 14,
marginTop: 16,
},

submitButtonText: {
color: "#FFFFFF",
textAlign: "center",
fontWeight: "800",
},

note: {
marginTop: 12,
color: "#666666",
fontSize: 12,
lineHeight: 18,
},
});