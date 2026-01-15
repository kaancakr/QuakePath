import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

const SettingsScreen = () => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { user, userProfile, logout, isRescueTeam } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [language, setLanguage] = useState('Türkçe');

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderSettingItem = (
    icon: string, 
    title: string, 
    value: string | boolean, 
    onPress: () => void, 
    isSwitch: boolean = false
  ) => (
    <TouchableOpacity 
      style={[
        styles.settingItem, 
        { 
          backgroundColor: colors.background,
          borderBottomColor: colors.border + '40',
        }
      ]} 
      onPress={isSwitch ? undefined : onPress}
      disabled={isSwitch}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + '20' }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
      {isSwitch ? (
        <Switch
          value={value as boolean}
          onValueChange={onPress}
          trackColor={{ false: colors.grey + '60', true: colors.primary + '60' }}
          thumbColor={value ? colors.primary : colors.grey}
        />
      ) : (
        <View style={styles.settingValueContainer}>
          {value && <Text style={[styles.settingValue, { color: colors.grey }]}>{value as string}</Text>}
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.grey} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primary + '20' }]}>
              <MaterialCommunityIcons name="cog" size={32} color={colors.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.title, { color: colors.text }]}>Ayarlar</Text>
              <Text style={[styles.subtitle, { color: colors.grey }]}>
                Uygulama tercihleri ve hesap ayarları
              </Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="account" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Hesap</Text>
          </View>
          
          {user ? (
            <View style={styles.userInfoContainer}>
              <View style={styles.userInfoRow}>
                <MaterialCommunityIcons name="email" size={20} color={colors.grey} />
                <Text style={[styles.userInfoText, { color: colors.text }]}>
                  {user.email}
                </Text>
              </View>
              <View style={styles.userInfoRow}>
                <MaterialCommunityIcons 
                  name={isRescueTeam ? "shield-account" : "account"} 
                  size={20} 
                  color={colors.grey} 
                />
                <Text style={[styles.userInfoText, { color: colors.text }]}>
                  {isRescueTeam ? 'Rescue Team' : 'Civilian'}
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.logoutButton, { backgroundColor: colors.error }]} 
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="logout" size={20} color="white" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.userInfoContainer}>
              <Text style={[styles.sectionSubtitle, { color: colors.grey }]}>
                Please log in to access your account
              </Text>
              <TouchableOpacity 
                style={[styles.loginButton, { backgroundColor: colors.primary }]} 
                onPress={() => router.push('/login')}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Preferences Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="tune" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tercihler</Text>
          </View>
          
          {renderSettingItem(
            'theme-light-dark', 
            'Karanlık Mod', 
            isDarkMode, 
            toggleTheme, 
            true
          )}
          
          {renderSettingItem(
            'bell', 
            'Bildirimler', 
            notifications, 
            () => setNotifications(!notifications), 
            true
          )}
          
          {renderSettingItem(
            'map-marker', 
            'Konum Servisleri', 
            locationServices, 
            () => setLocationServices(!locationServices), 
            true
          )}
          
          {renderSettingItem(
            'translate', 
            'Dil', 
            language, 
            () => {}, 
            false
          )}
        </View>

        {/* About Section */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="information" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Hakkında</Text>
          </View>
          
          {renderSettingItem(
            'information-outline', 
            'Uygulama Versiyonu', 
            '1.0.0', 
            () => {}, 
            false
          )}
          
          {renderSettingItem(
            'shield-lock', 
            'Gizlilik Politikası', 
            '', 
            () => {}, 
            false
          )}
          
          {renderSettingItem(
            'file-document', 
            'Kullanım Koşulları', 
            '', 
            () => {}, 
            false
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  content: {
    padding: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    gap: 12,
  },
  loginTypeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeToggleButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeToggleText: {
    fontWeight: '700',
  },
  input: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    fontSize: 15,
  },
  loginButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfoContainer: {
    gap: 12,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  userInfoText: {
    fontSize: 16,
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loggedInContainer: {
    gap: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  profileIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  loggedInText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userTypeText: {
    fontSize: 13,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValue: {
    fontSize: 14,
  },
});

export default SettingsScreen; 