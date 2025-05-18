import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';

const SettingsScreen = () => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRescueTeam, setIsRescueTeam] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [language, setLanguage] = useState('English');

  const handleLogin = () => {
    // TODO: Implement actual login logic
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setIsRescueTeam(false);
  };

  const toggleRescueTeam = () => {
    setIsRescueTeam(!isRescueTeam);
  };

  const renderSettingItem = (
    icon: string, 
    title: string, 
    value: string | boolean, 
    onPress: () => void, 
    isSwitch: boolean = false
  ) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: colors.border }]} 
      onPress={isSwitch ? undefined : onPress}
      disabled={isSwitch}
    >
      <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
        <MaterialIcons name={icon as any} size={22} color={colors.primary} />
      </View>
      <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
      {isSwitch ? (
        <Switch
          value={value as boolean}
          onValueChange={onPress}
          trackColor={{ false: colors.grey, true: colors.primary }}
          thumbColor={colors.light}
        />
      ) : (
        <View style={styles.settingValueContainer}>
          <Text style={[styles.settingValue, { color: colors.grey }]}>{value as string}</Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.grey} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <MaterialIcons name="settings" size={24} color={colors.primary} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        
        {!isLoggedIn ? (
          <View style={styles.loginContainer}>
            <View style={[styles.loginTypeToggle, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
              <TouchableOpacity 
                style={[
                  styles.toggleButton, 
                  !isRescueTeam && styles.activeToggleButton
                ]} 
                onPress={() => setIsRescueTeam(false)}
              >
                <Text style={[
                  styles.toggleText, 
                  !isRescueTeam && styles.activeToggleText
                ]}>User</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.toggleButton, 
                  isRescueTeam && styles.activeToggleButton
                ]} 
                onPress={() => setIsRescueTeam(true)}
              >
                <Text style={[
                  styles.toggleText, 
                  isRescueTeam && styles.activeToggleText
                ]}>Rescue Team</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { 
                backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
                borderColor: isDarkMode ? '#444' : '#e0e0e0',
                color: colors.text
              }]}
              placeholder="Email"
              placeholderTextColor={colors.grey}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDarkMode ? '#333' : '#f9f9f9',
                borderColor: isDarkMode ? '#444' : '#e0e0e0',
                color: colors.text
              }]}
              placeholder="Password"
              placeholderTextColor={colors.grey}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>
                {isRescueTeam ? 'Login as Rescue Team' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loggedInContainer}>
            <View style={styles.profileHeader}>
              <View style={[styles.profileIconContainer, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
                <MaterialIcons 
                  name={isRescueTeam ? "medical-services" : "account-circle"} 
                  size={48} 
                  color={colors.primary} 
                />
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.loggedInText, { color: colors.text }]}>{email}</Text>
                <Text style={[styles.userTypeText, { color: colors.grey }]}>
                  {isRescueTeam ? 'Rescue Team Member' : 'Regular User'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color={colors.light} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
        
        {renderSettingItem(
          'dark-mode', 
          'Dark Mode', 
          isDarkMode, 
          toggleTheme, 
          true
        )}
        
        {renderSettingItem(
          'notifications', 
          'Notifications', 
          notifications, 
          () => setNotifications(!notifications), 
          true
        )}
        
        {renderSettingItem(
          'location-on', 
          'Location Services', 
          locationServices, 
          () => setLocationServices(!locationServices), 
          true
        )}
        
        {renderSettingItem(
          'language', 
          'Language', 
          language, 
          () => {}, 
          false
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        
        {renderSettingItem(
          'info', 
          'App Version', 
          '1.0.0', 
          () => {}, 
          false
        )}
        
        {renderSettingItem(
          'privacy-tip', 
          'Privacy Policy', 
          '', 
          () => {}, 
          false
        )}
        
        {renderSettingItem(
          'description', 
          'Terms of Service', 
          '', 
          () => {}, 
          false
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  loginContainer: {
    gap: 16,
  },
  loginTypeToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeToggleButton: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grey,
  },
  activeToggleText: {
    color: Colors.light,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: Colors.light,
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
  },
  userTypeText: {
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: Colors.red,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: Colors.light,
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    marginRight: 4,
  },
});

export default SettingsScreen; 