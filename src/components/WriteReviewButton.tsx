import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type WriteReviewButtonProps = {
  title: string;
  onPress: () => void;
};

export function WriteReviewButton({ title, onPress }: WriteReviewButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      activeOpacity={0.86}
      onPress={onPress}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>✍️</Text>
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Share your outlet shopping experience</Text>
      </View>

      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#0B1F3A",
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  icon: {
    fontSize: 20,
  },

  textWrap: {
    flex: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  subtitle: {
    color: "#D8DEE9",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },

  arrow: {
    color: "#C9A227",
    fontSize: 22,
    fontWeight: "900",
  },
});
