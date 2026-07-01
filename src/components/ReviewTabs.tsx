import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ReviewSort = "helpful" | "recent";

type ReviewTabsProps = {
  activeTab: ReviewSort;
  helpfulText: string;
  recentText: string;
  onChangeTab: (tab: ReviewSort) => void;
};

export function ReviewTabs({
  activeTab,
  helpfulText,
  recentText,
  onChangeTab,
}: ReviewTabsProps) {
  return (
    <View style={styles.container}>
      <TabButton
        title={helpfulText}
        icon="👍"
        active={activeTab === "helpful"}
        onPress={() => onChangeTab("helpful")}
      />

      <TabButton
        title={recentText}
        icon="🕒"
        active={activeTab === "recent"}
        onPress={() => onChangeTab("recent")}
      />
    </View>
  );
}

type TabButtonProps = {
  title: string;
  icon: string;
  active: boolean;
  onPress: () => void;
};

function TabButton({ title, icon, active, onPress }: TabButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      activeOpacity={0.86}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {icon} {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#F7F8FA",
    borderRadius: 18,
    padding: 4,
    marginTop: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  tab: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 8,
    alignItems: "center",
  },

  tabActive: {
    backgroundColor: "#0B1F3A",
  },

  tabText: {
    color: "#0B1F3A",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },

  tabTextActive: {
    color: "#FFFFFF",
  },
});
