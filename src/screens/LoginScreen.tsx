import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
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

import { useAuth } from "../contexts/AuthContext";

export function LoginScreen() {
  const navigation = useNavigation<any>();
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginWithApple } = useAuth();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Missing information", "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      await loginWithEmail(email.trim(), password);
      navigation.goBack();
    } catch {
      Alert.alert("Sign in failed", "Please check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    if (!email.trim() || password.length < 6) {
      Alert.alert("Check your details", "Use a valid email and at least 6 characters for password.");
      return;
    }

    try {
      setLoading(true);
      await registerWithEmail(email.trim(), password);
      navigation.goBack();
    } catch {
      Alert.alert("Account could not be created", "Please try again with another email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigation.goBack();
    } catch {
      Alert.alert("Google Sign-In", "Google sign-in will be connected in the next release.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApple() {
    try {
      setLoading(true);
      await loginWithApple();
      navigation.goBack();
    } catch {
      Alert.alert("Apple Sign-In", "Apple sign-in will be connected in the next release.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>MY OUTLET GUIDE</Text>
          <Text style={styles.title}>Sign in to sync your shopping world.</Text>
          <Text style={styles.subtitle}>
            Save trips, favorites, reviews and flight deal preferences across devices.
          </Text>
        </View>

        <TouchableOpacity style={styles.appleButton} activeOpacity={0.86} onPress={handleApple}>
          <Text style={styles.appleButtonText}> Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} activeOpacity={0.86} onPress={handleGoogle}>
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emailButton}
          activeOpacity={0.86}
          onPress={() => setShowEmailForm((current) => !current)}
        >
          <Text style={styles.emailButtonText}>
            {showEmailForm ? "Hide email sign in" : "Continue with email"}
          </Text>
        </TouchableOpacity>

        {showEmailForm && (
          <View style={styles.emailCard}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#8A8A8A"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 characters"
              placeholderTextColor="#8A8A8A"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              activeOpacity={0.86}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>{loading ? "Please wait..." : "Sign in"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.86}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Create account</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.termsText}>
          By continuing, you agree to the Terms of Use and Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  content: { padding: 20, paddingTop: 64, paddingBottom: 120 },
  heroCard: {
    backgroundColor: "#0B1F3A",
    borderRadius: 30,
    padding: 24,
    marginBottom: 18,
  },
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
  appleButton: {
    backgroundColor: "#111111",
    borderRadius: 20,
    padding: 17,
    marginBottom: 12,
  },
  appleButtonText: { color: "#FFFFFF", fontWeight: "900", textAlign: "center", fontSize: 15 },
  socialButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
  },
  socialButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center", fontSize: 15 },
  emailButton: {
    backgroundColor: "#FFF8E1",
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: "#C9A227",
    marginBottom: 16,
  },
  emailButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center", fontSize: 15 },
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
  primaryButton: { backgroundColor: "#0B1F3A", borderRadius: 17, padding: 16, marginTop: 2 },
  disabledButton: { opacity: 0.65 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "900", textAlign: "center" },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryButtonText: { color: "#0B1F3A", fontWeight: "900", textAlign: "center" },
  termsText: { color: "#666666", textAlign: "center", lineHeight: 20, marginTop: 4 },
});
