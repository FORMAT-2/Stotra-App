import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSacredTheme } from '../contexts/ThemeContext';
import { SacredColors, Spacing, FontSizes, BorderRadius } from '../constants/Theme';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

export default function EditProfileScreen() {
  const { theme } = useSacredTheme();
  const router = useRouter();
  const { user } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.display_name || '');
      setEmail(user.email || '');
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to update your avatar.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const updates = {
        data: {
          display_name: displayName,
          avatar_url: avatarUrl,
        }
      };

      const { error: metadataError } = await supabase.auth.updateUser(updates);
      if (metadataError) throw metadataError;

      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
        Alert.alert(
          'Email Update Started',
          'We have sent a confirmation link to your new email address. Please verify it.'
        );
      }

      router.back();
    } catch (error: any) {
      Alert.alert('Update Failed', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.saveButton}>
          {isSaving ? (
            <ActivityIndicator size="small" color={SacredColors.gold[500]} />
          ) : (
            <Text style={[styles.saveText, { color: SacredColors.gold[500] }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={[SacredColors.gold[500], SacredColors.saffron[600]]}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarEmoji}>🙏</Text>
              </LinearGradient>
            )}
            <View style={[styles.editIconBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="camera" size={14} color={theme.text} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarHint, { color: theme.textTertiary }]}>Tap to change photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Display Name</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="person-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              placeholderTextColor={theme.textMuted}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="mail-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
              placeholderTextColor={theme.textMuted}
            />
          </View>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: Spacing.sm,
  },
  saveButton: {
    padding: Spacing.sm,
    minWidth: 60,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  saveText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  content: {
    padding: Spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
    marginTop: Spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarHint: {
    fontSize: FontSizes.sm,
  },
  formGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: FontSizes.md,
  },
});
