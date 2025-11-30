import React, { useState } from "react";
import { StyleSheet, View, TextInput, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import Spacer from "@/components/Spacer";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius, Typography, Colors } from "@/constants/theme";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { signIn, signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Bitte E-Mail und Passwort eingeben");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      const errorCode = err?.code || "";
      if (errorCode === "auth/invalid-email") {
        setError("Ungültige E-Mail-Adresse");
      } else if (errorCode === "auth/user-not-found") {
        setError("Benutzer nicht gefunden");
      } else if (errorCode === "auth/wrong-password") {
        setError("Falsches Passwort");
      } else if (errorCode === "auth/invalid-credential") {
        setError("E-Mail oder Passwort falsch");
      } else {
        setError("Anmeldung fehlgeschlagen");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Bitte E-Mail und Passwort eingeben");
      return;
    }

    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signUp(email.trim(), password);
    } catch (err: any) {
      const errorCode = err?.code || "";
      if (errorCode === "auth/email-already-in-use") {
        setError("E-Mail bereits registriert");
      } else if (errorCode === "auth/invalid-email") {
        setError("Ungültige E-Mail-Adresse");
      } else if (errorCode === "auth/weak-password") {
        setError("Passwort zu schwach");
      } else {
        setError("Registrierung fehlgeschlagen");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundDefault,
      color: theme.text,
      borderColor: theme.border,
    },
  ];

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
      ]}
    >
      <View style={styles.content}>
        <ThemedText type="h1" style={styles.title}>
          To-Do-App
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Melde dich an, um deine Aufgaben zu verwalten
        </ThemedText>

        <Spacer height={Spacing["4xl"]} />

        <View style={styles.form}>
          <TextInput
            style={inputStyle}
            value={email}
            onChangeText={setEmail}
            placeholder="E-Mail"
            placeholderTextColor={theme.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            editable={!loading}
          />

          <Spacer height={Spacing.lg} />

          <TextInput
            style={inputStyle}
            value={password}
            onChangeText={setPassword}
            placeholder="Passwort"
            placeholderTextColor={theme.placeholder}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="done"
            editable={!loading}
          />

          {error ? (
            <>
              <Spacer height={Spacing.md} />
              <ThemedText
                type="small"
                style={[styles.errorText, { color: isDark ? Colors.dark.destructive : Colors.light.destructive }]}
              >
                {error}
              </ThemedText>
            </>
          ) : null}

          <Spacer height={Spacing["2xl"]} />

          {loading ? (
            <ActivityIndicator size="large" color={theme.link} />
          ) : (
            <>
              <Button onPress={handleLogin}>Anmelden</Button>

              <Spacer height={Spacing.lg} />

              <Button
                onPress={handleRegister}
                style={[styles.secondaryButton, { 
                  backgroundColor: "transparent", 
                  borderColor: theme.link,
                },
                ]}
                textStyle={{ color: theme.link }}
              >
                Registrieren
              </Button>
            </>
          )}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  form: {
    width: "100%",
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.body.fontSize,
  },
  errorText: {
    textAlign: "center",
  },
  secondaryButton: {
    borderWidth: 1,
  },
});
