/**
 * Login Screen
 * Handles user authentication and role selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'civilian' | 'rescue_team'>('civilian');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, signUp } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();
  
  // Softer red color for a more pleasant appearance
  const softRed = '#D32F2F';

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && !selectedRole) {
      Alert.alert('Error', 'Please select a role');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, selectedRole);
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await signIn(email, password);
        router.replace('/(drawer)/dashboard');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Authentication failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 24,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logoContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 36,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 16,
      color: colors.grey,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: 20,
    },
    formSection: {
      marginBottom: 30,
    },
    roleContainer: {
      marginBottom: 24,
    },
    roleTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    roleOptions: {
      flexDirection: 'row',
      gap: 12,
    },
    roleCard: {
      flex: 1,
      padding: 20,
      borderRadius: 16,
      borderWidth: 2,
      alignItems: 'center',
      minHeight: 140,
      justifyContent: 'center',
    },
    roleCardSelected: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    roleCardUnselected: {
      opacity: 0.7,
    },
    roleIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    roleText: {
      fontSize: 16,
      marginBottom: 4,
    },
    roleDescription: {
      fontSize: 12,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      minHeight: 56,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 0,
    },
    passwordInput: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 0,
    },
    passwordToggle: {
      padding: 8,
      marginLeft: 8,
    },
    submitButton: {
      paddingVertical: 16,
      borderRadius: 12,
      marginTop: 8,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    submitButtonDisabled: {
      opacity: 0.6,
      shadowOpacity: 0,
    },
    submitButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    submitButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    footerSection: {
      marginTop: 20,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 14,
      fontWeight: '500',
    },
    toggleAuth: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    toggleAuthText: {
      fontSize: 15,
      marginBottom: 4,
    },
    toggleAuthLink: {
      fontSize: 16,
      fontWeight: '700',
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.headerSection}>
          <View style={[styles.logoContainer, { backgroundColor: softRed + '15' }]}>
            <MaterialCommunityIcons 
              name="map-marker-alert" 
              size={64} 
              color={softRed} 
            />
          </View>
          <Text style={styles.title}>QuakePath</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Create your account to get started' : 'Welcome back! Sign in to continue'}
          </Text>
        </Animated.View>

        {/* Form Section */}
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.formSection}>
          {isSignUp && (
            <Animated.View entering={FadeInDown.delay(300)} style={styles.roleContainer}>
              <Text style={styles.roleTitle}>Select Your Role</Text>
              <View style={styles.roleOptions}>
                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    selectedRole === 'civilian'
                      ? [styles.roleCardSelected, { borderColor: softRed, backgroundColor: softRed + '15', shadowColor: softRed }]
                      : [styles.roleCardUnselected, { borderColor: colors.border, backgroundColor: colors.card }],
                  ]}
                  onPress={() => setSelectedRole('civilian')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.roleIconContainer,
                    { backgroundColor: selectedRole === 'civilian' ? softRed + '20' : colors.background }
                  ]}>
                    <MaterialCommunityIcons
                      name="account"
                      size={32}
                      color={selectedRole === 'civilian' ? softRed : colors.grey}
                    />
                  </View>
                  <Text style={[
                    styles.roleText,
                    { color: selectedRole === 'civilian' ? softRed : colors.grey, fontWeight: '600' }
                  ]}>
                    Civilian
                  </Text>
                  <Text style={[styles.roleDescription, { color: colors.grey }]}>
                    Regular user
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    selectedRole === 'rescue_team'
                      ? [styles.roleCardSelected, { borderColor: colors.error, backgroundColor: colors.error + '15' }]
                      : [styles.roleCardUnselected, { borderColor: colors.border, backgroundColor: colors.card }],
                  ]}
                  onPress={() => setSelectedRole('rescue_team')}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.roleIconContainer,
                    { backgroundColor: selectedRole === 'rescue_team' ? colors.error + '20' : colors.background }
                  ]}>
                    <MaterialCommunityIcons
                      name="shield-account"
                      size={32}
                      color={selectedRole === 'rescue_team' ? colors.error : colors.grey}
                    />
                  </View>
                  <Text style={[
                    styles.roleText,
                    { color: selectedRole === 'rescue_team' ? colors.error : colors.grey, fontWeight: '600' }
                  ]}>
                    Rescue Team
                  </Text>
                  <Text style={[styles.roleDescription, { color: colors.grey }]}>
                    Emergency responder
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons 
                name="email" 
                size={20} 
                color={colors.grey} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email address"
                placeholderTextColor={colors.grey + '80'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <MaterialIcons 
                name="lock" 
                size={20} 
                color={colors.grey} 
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.grey + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={22}
                  color={colors.grey}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
              { backgroundColor: softRed, shadowColor: softRed }
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <View style={styles.submitButtonContent}>
                <Text style={styles.submitButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Footer Section */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.footerSection}>
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.grey }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>
          
          <TouchableOpacity
            style={styles.toggleAuth}
            onPress={() => setIsSignUp(!isSignUp)}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleAuthText, { color: colors.grey }]}>
              {isSignUp
                ? 'Already have an account?'
                : "Don't have an account?"}
            </Text>
            <Text style={[styles.toggleAuthLink, { color: softRed }]}>
              {isSignUp ? 'Sign In' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
