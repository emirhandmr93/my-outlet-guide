import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type HomeHeaderProps = {
userName?: string;
isGuest?: boolean;
onPressMenu?: () => void;
onPressNotifications?: () => void;
onPressLanguage?: () => void;
};

function getGreeting(userName?: string, isGuest?: boolean) {
if (isGuest || !userName) {
return "Welcome to My Outlet Guide";
}

const hour = new Date().getHours();

if (hour < 12) {
return `Good Morning,\n${userName}`;
}

if (hour < 18) {
return `Good Afternoon,\n${userName}`;
}

return `Good Evening,\n${userName}`;
}

export function HomeHeader({
userName,
isGuest,
onPressMenu,
onPressNotifications,
onPressLanguage,
}: HomeHeaderProps) {
const title = getGreeting(userName, isGuest);
const subtitle =
isGuest || !userName
? "Discover premium outlets, save more, and plan your next shopping trip."
: "Plan smarter outlet trips, track savings, and discover premium shopping destinations.";

return (
<View style={styles.wrapper}>
<View style={styles.topBar}>
<TouchableOpacity style={styles.iconButton} activeOpacity={0.84} onPress={onPressMenu}>
<Text style={styles.menuIcon}>☰</Text>
</TouchableOpacity>

<View pointerEvents="none" style={styles.brandWrap}>
<Image
source={require("../../assets/brand/app-icon.png")}
style={styles.brandIcon}
resizeMode="contain"
/>
<Text style={styles.brandText}>MY OUTLET GUIDE</Text>
</View>

<View style={styles.rightActions}>
<TouchableOpacity style={styles.iconButton} activeOpacity={0.84} onPress={onPressNotifications}>
<Text style={styles.bellIcon}>🔔</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.languageButton} activeOpacity={0.84} onPress={onPressLanguage}>
<Text style={styles.languageText}>🇬🇧 EN</Text>
</TouchableOpacity>
</View>
</View>

<ImageBackground
source={require("../../assets/outlet-images/la-vallee/hero.webp")}
style={styles.hero}
imageStyle={styles.heroImage}
>
<View style={styles.overlay}>
<Text style={styles.title}>{title}</Text>
<Text style={styles.subtitle}>{subtitle}</Text>
</View>
</ImageBackground>
</View>
);
}

const styles = StyleSheet.create({
wrapper: {
marginBottom: spacing.lg,
},

topBar: {
flexDirection: "row",
alignItems: "center",
justifyContent: "space-between",
marginBottom: spacing.md,
marginTop: spacing.sm,
position: "relative",
},

brandWrap: {
position: "absolute",
left: 62,
right: 132,
height: 46,
flexDirection: "row",
alignItems: "center",
justifyContent: "center",
},

brandIcon: {
width: 34,
height: 34,
marginRight: spacing.xs,
},

brandText: {
color: colors.primary,
fontSize: typography.bodySmall,
fontWeight: typography.weightBlack,
letterSpacing: 0.7,
},

rightActions: {
flexDirection: "row",
alignItems: "center",
gap: spacing.sm,
},

iconButton: {
width: 46,
height: 46,
borderRadius: radius.pill,
backgroundColor: colors.surface,
borderWidth: 1,
borderColor: colors.border,
alignItems: "center",
justifyContent: "center",
...shadows.soft,
},

languageButton: {
height: 46,
minWidth: 74,
borderRadius: radius.pill,
backgroundColor: colors.surface,
borderWidth: 1,
borderColor: colors.border,
alignItems: "center",
justifyContent: "center",
paddingHorizontal: spacing.md,
...shadows.soft,
},

menuIcon: {
color: colors.textPrimary,
fontSize: 22,
fontWeight: typography.weightBlack,
marginTop: -1,
},

bellIcon: {
fontSize: 20,
marginTop: -1,
},

languageText: {
color: colors.textPrimary,
fontSize: typography.bodySmall,
fontWeight: typography.weightBlack,
textAlign: "center",
},

hero: {
minHeight: 280,
borderRadius: radius.hero,
overflow: "hidden",
backgroundColor: colors.primary,
...shadows.premium,
},

heroImage: {
borderRadius: radius.hero,
},

overlay: {
flex: 1,
minHeight: 280,
padding: spacing.xxl,
justifyContent: "flex-end",
backgroundColor: "rgba(11,31,58,0.64)",
},


title: {
color: colors.textInverse,
fontSize: typography.h1,
lineHeight: typography.lineH1,
fontWeight: typography.weightBlack,
letterSpacing: -0.7,
marginBottom: spacing.md,
},

subtitle: {
color: "#EEF2F7",
fontSize: typography.body,
lineHeight: typography.lineBody,
fontWeight: typography.weightMedium,
maxWidth: 310,
},
});