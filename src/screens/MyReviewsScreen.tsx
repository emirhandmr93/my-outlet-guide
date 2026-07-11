import {
ScrollView,
StyleSheet,
Text,
TouchableOpacity,
View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { outlets } from "../constants/outlets";

import { useReviews } from "../contexts/ReviewsContext";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "../hooks/useTranslation";


export function MyReviewsScreen() {
const { reviews } = useReviews();
const { currentUser } = useUser();
const navigation = useNavigation<any>();
const { t } = useTranslation();

const myReviews = Array.from(
new Map(
reviews
.filter((review) => review.userId === currentUser?.userId && (review.status ?? "published") === "published")
.map((review) => [`${review.outletId}_${review.userId}`, review]),
).values(),
);

return (
<ScrollView
style={styles.container}
contentContainerStyle={styles.content}
>
<Text style={styles.pageTitle}>{t("myReviews.title")}</Text>

<Text style={styles.pageSubtitle}>
{t("myReviews.subtitle")}
</Text>

{myReviews.length === 0 ? (
<View style={styles.emptyCard}>
<Text style={styles.emptyTitle}>
{t("myReviews.emptyTitle")}
</Text>

<Text style={styles.emptyText}>
{t("myReviews.emptyText")}
</Text>
</View>
) : (
myReviews.map((review) => (
<View
key={`${review.outletId}_${review.reviewId}`}
style={styles.reviewCard}
>
<Text style={styles.reviewOutlet}>
{
outlets.find(
(outlet) => outlet.outletId === review.outletId
)?.name || review.outletId
}
</Text>

<Text style={styles.reviewRating}>
⭐ {review.rating}
</Text>

<Text style={styles.reviewComment}>
{review.comment}
</Text>

<Text style={styles.reviewDate}>
{review.createdAt}
</Text>

<TouchableOpacity
style={styles.viewOutletButton}
onPress={() =>
navigation.navigate("OutletDetail", {
outletId: review.outletId,
})
}
>
<Text style={styles.viewOutletButtonText}>
{t("myReviews.viewOutlet")}
</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.editButton}
onPress={() =>
navigation.navigate("WriteReview", {
outletId: review.outletId,
reviewId: review.reviewId,
})
}
>
<Text style={styles.editButtonText}>
{t("common.edit")}
</Text>
</TouchableOpacity>
</View>
))
)}
</ScrollView>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: "#F7F8FA",
},

content: {
padding: 20,
paddingTop: 60,
paddingBottom: 120,
},

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

emptyCard: {
backgroundColor: "#FFFFFF",
borderRadius: 20,
padding: 20,
borderWidth: 1,
borderColor: "#E5E7EB",
},

emptyTitle: {
fontSize: 18,
fontWeight: "800",
color: "#0B1F3A",
},

emptyText: {
color: "#666666",
marginTop: 8,
},

reviewCard: {
backgroundColor: "#FFFFFF",
borderRadius: 18,
padding: 18,
borderWidth: 1,
borderColor: "#E5E7EB",
marginBottom: 12,
},

reviewOutlet: {
color: "#C9A227",
fontWeight: "800",
},

reviewRating: {
marginTop: 6,
fontWeight: "800",
color: "#0B1F3A",
},

reviewComment: {
marginTop: 8,
color: "#666666",
lineHeight: 20,
},

reviewDate: {
marginTop: 10,
color: "#999999",
fontSize: 12,
},

viewOutletButton: {
backgroundColor: "#0B1F3A",
borderRadius: 14,
padding: 12,
marginTop: 12,
},

viewOutletButtonText: {
color: "#FFFFFF",
fontWeight: "800",
textAlign: "center",
},

editButton: {
backgroundColor: "#FFFFFF",
borderRadius: 14,
padding: 12,
marginTop: 8,
borderWidth: 1,
borderColor: "#E5E7EB",
},

editButtonText: {
color: "#0B1F3A",
fontWeight: "800",
textAlign: "center",
},

});