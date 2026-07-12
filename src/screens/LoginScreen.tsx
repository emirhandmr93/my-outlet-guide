import { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { LocalHeroImageCard } from "../components/LocalHeroImageCard";
import { useAuth } from "../contexts/AuthContext";
import { heroAssets } from "../media/heroAssets";
import { useTranslation } from "../hooks/useTranslation";

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { loginWithEmail, registerWithEmail, resetPasswordWithEmail } =
    useAuth();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert(t("auth.missingTitle"), t("auth.missingMessage"));
      return;
    }

    try {
      setLoading(true);
      await loginWithEmail(email.trim(), password);
      navigation.goBack();
    } catch {
      Alert.alert(t("auth.signInFailedTitle"), t("auth.signInFailedMessage"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      Alert.alert(
        t("auth.resetPasswordTitle"),
        t("auth.resetPasswordEmailRequired"),
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Alert.alert(
        t("auth.resetPasswordTitle"),
        t("auth.resetPasswordInvalidEmail"),
      );
      return;
    }

    try {
      setResetLoading(true);
      await resetPasswordWithEmail(cleanEmail);
      Alert.alert(t("auth.resetPasswordTitle"), t("auth.resetPasswordSent"));
    } catch {
      Alert.alert(t("auth.resetPasswordTitle"), t("auth.resetPasswordFailed"));
    } finally {
      setResetLoading(false);
    }
  }

  async function handleRegister() {
    if (!email.trim() || password.length < 6) {
      Alert.alert(t("auth.checkDetailsTitle"), t("auth.checkDetailsMessage"));
      return;
    }

    try {
      setLoading(true);
      await registerWithEmail(email.trim(), password);
      navigation.goBack();
    } catch {
      Alert.alert(t("auth.createFailedTitle"), t("auth.createFailedMessage"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <LocalHeroImageCard imageSource={heroAssets.login} style={styles.heroCard} contentStyle={styles.heroInner}>
          <Text style={styles.kicker}>{t("auth.kicker")}</Text>
          <Text style={styles.title}>{t("auth.title")}</Text>
          <Text style={styles.subtitle}>{route.params?.authMessage || t("auth.subtitle")}</Text>
        </LocalHeroImageCard>

        <TouchableOpacity
          style={styles.emailButton}
          activeOpacity={0.86}
          onPress={() => setShowEmailForm((current) => !current)}
        >
          <Text style={styles.emailButtonText}>
            {showEmailForm ? t("auth.hideEmail") : t("auth.continueEmail")}
          </Text>
        </TouchableOpacity>

        {showEmailForm && (
          <View style={styles.emailCard}>
            <Text style={styles.label}>{t("auth.emailLabel")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("auth.emailPlaceholder")}
              placeholderTextColor="#8A8A8A"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>{t("auth.passwordLabel")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("auth.passwordPlaceholder")}
              placeholderTextColor="#8A8A8A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              activeOpacity={0.86}
              onPress={handleLogin}
              disabled={loading || resetLoading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? t("auth.pleaseWait") : t("auth.signIn")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              activeOpacity={0.86}
              onPress={handleResetPassword}
              disabled={loading || resetLoading}
            >
              <Text style={styles.resetButtonText}>
                {resetLoading
                  ? t("auth.resetPasswordSending")
                  : t("auth.forgotPassword")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.86}
              onPress={handleRegister}
              disabled={loading || resetLoading}
            >
              <Text style={styles.secondaryButtonText}>
                {t("auth.createAccount")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.termsText}>{t("auth.termsText")}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 64, paddingBottom: 120 },
  heroCard: { marginBottom: 18 },
  heroInner: { padding: 24 },
  kicker: {
    color: "#C9A227",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
  },
  subtitle: {
    color: "#D8DEE9",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  emailButton: {
    backgroundColor: "#FFF8E1",
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: "#C9A227",
    marginBottom: 16,
  },
  emailButtonText: {
    color: "#0B1F3A",
    fontWeight: "900",
    textAlign: "center",
    fontSize: 15,
  },
  emailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  label: { color: "#0B1F3A", fontWeight: "900", marginBottom: 8 },
  input: {
    backgroundColor: "#F7F8FA",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    color: "#0B1F3A",
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#0B1F3A",
    borderRadius: 17,
    padding: 16,
    marginTop: 2,
  },
  disabledButton: { opacity: 0.65 },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
  },
  resetButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#0B1F3A",
    fontWeight: "800",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryButtonText: {
    color: "#0B1F3A",
    fontWeight: "900",
    textAlign: "center",
  },
  termsText: {
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 4,
  },
});
