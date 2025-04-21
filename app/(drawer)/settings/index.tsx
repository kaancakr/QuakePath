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
  Animated,
  Platform,
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
  const [scaleAnim] = useState(new Animated.Value(1));

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

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderSettingItem = (
    icon: string, 
    title: string, 
    value: string | boolean, 
    onPress: () => void, 
    isSwitch: boolean = false
  ) => (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={[
          styles.settingItem, 
          { 
            borderBottomColor: isDarkMode ? Colors.darkBorder : Colors.border,
            backgroundColor: isDarkMode ? Colors.darkCard : Colors.card,
          }
        ]} 
        onPress={isSwitch ? undefined : () => {
          animatePress();
          onPress();
        }}
        disabled={isSwitch}
      >
        <View style={[
          styles.settingIconContainer, 
          { 
            backgroundColor: isDarkMode ? Colors.darkAccentGrey : Colors.lightGrey,
            borderWidth: 1,
            borderColor: isDarkMode ? Colors.darkBorder : Colors.border,
          }
        ]}>
          <MaterialIcons name={icon as any} size={22} color={isDarkMode ? Colors.darkText : Colors.text} />
        </View>
        <Text style={[styles.settingTitle, { color: isDarkMode ? Colors.darkText : Colors.text }]}>{title}</Text>
        {isSwitch ? (
          <Switch
            value={value as boolean}
            onValueChange={onPress}
            trackColor={{ false: Colors.darkCard, true: isDarkMode ? Colors.darkAccentGrey : Colors.lightGrey }}
            thumbColor={isDarkMode ? Colors.darkText : Colors.text}
          />
        ) : (
          <View style={styles.settingValueContainer}>
            <Text style={[
              styles.settingValue, 
              { color: isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary }
            ]}>{value as string}</Text>
            <MaterialIcons 
              name="chevron-right" 
              size={20} 
              color={isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary} 
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: isDarkMode ? Colors.darkBackground : Colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDarkMode ? Colors.darkText : Colors.text }]}>Settings</Text>
        <View style={[
          styles.headerIconContainer,
          { backgroundColor: isDarkMode ? Colors.darkAccentGrey : Colors.lightGrey }
        ]}>
          <MaterialIcons 
            name="settings" 
            size={24} 
            color={isDarkMode ? Colors.darkText : Colors.text} 
          />
        </View>
      </View>

      <View style={[
        styles.section, 
        { 
          backgroundColor: isDarkMode ? Colors.darkCard : Colors.card,
          borderWidth: 1,
          borderColor: isDarkMode ? Colors.darkBorder : Colors.border,
        }
      ]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? Colors.darkText : Colors.text }]}>Account</Text>
        
        {!isLoggedIn ? (
          <View style={styles.loginContainer}>
            <View style={[
              styles.loginTypeToggle, 
              { 
                backgroundColor: isDarkMode ? Colors.darkAccentGrey : Colors.lightGrey,
                borderWidth: 1,
                borderColor: isDarkMode ? Colors.darkBorder : Colors.border,
              }
            ]}>
              <TouchableOpacity 
                style={[
                  styles.toggleButton, 
                  !isRescueTeam && {
                    backgroundColor: isDarkMode ? Colors.darkCard : Colors.card,
                    borderWidth: 1,
                    borderColor: isDarkMode ? Colors.darkBorder : Colors.border,
                  }
                ]} 
                onPress={() => setIsRescueTeam(false)}
              >
                <Text style={[
                  styles.toggleText, 
                  { color: isDarkMode ? Colors.darkText : Colors.text }
                ]}>User</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.toggleButton, 
                  isRescueTeam && {
                    backgroundColor: isDarkMode ? Colors.darkCard : Colors.card,
                    borderWidth: 1,
                    borderColor: isDarkMode ? Colors.darkBorder : Colors.border,
                  }
                ]} 
                onPress={() => setIsRescueTeam(true)}
              >
                <Text style={[
                  styles.toggleText, 
                  { color: isDarkMode ? Colors.darkText : Colors.text }
                ]}>Rescue Team</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: isDarkMode ? Colors.darkCard : Colors.card,
                  borderColor: isDarkMode ? Colors.darkBorder : Colors.border,
                  color: isDarkMode ? Colors.darkText : Colors.text,
                }
              ]}
              placeholder="Email"
              placeholderTextColor={isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: isDarkMode ? Colors.darkCard : Colors.card,
                  borderColor: isDarkMode ? Colors.darkBorder : Colors.border,
                  color: isDarkMode ? Colors.darkText : Colors.text,
                }
              ]}
              placeholder="Password"
              placeholderTextColor={isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity 
              style={[
                styles.loginButton,
                {
                  backgroundColor: isDarkMode ? Colors.darkAccentGrey : Colors.text,
                  borderWidth: 0,
                }
              ]} 
              onPress={handleLogin}
            >
              <Text style={[
                styles.loginButtonText,
                { color: isDarkMode ? Colors.primary : Colors.darkLightGrey }
              ]}>
                {isRescueTeam ? 'Login as Rescue Team' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loggedInContainer}>
            <View style={styles.profileHeader}>
              <View style={[
                styles.profileIconContainer, 
                { 
                  backgroundColor: isDarkMode ? Colors.darkAccentGrey : Colors.lightGrey,
                  borderWidth: 1,
                  borderColor: isDarkMode ? Colors.darkBorder : Colors.border,
                }
              ]}>
                <MaterialIcons 
                  name={isRescueTeam ? "medical-services" : "account-circle"} 
                  size={48} 
                  color={isDarkMode ? Colors.darkText : Colors.text} 
                />
              </View>
              <View style={styles.profileInfo}>
                <Text style={[
                  styles.loggedInText, 
                  { color: isDarkMode ? Colors.darkText : Colors.text }
                ]}>{email}</Text>
                <Text style={[
                  styles.userTypeText, 
                  { color: isDarkMode ? Colors.darkTextSecondary : Colors.textSecondary }
                ]}>
                  {isRescueTeam ? 'Rescue Team Member' : 'Regular User'}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[
                styles.logoutButton,
                {
                  backgroundColor: isDarkMode ? Colors.darkAccentGrey : Colors.text,
                  borderWidth: 0,
                }
              ]} 
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={20} color={isDarkMode ? Colors.text : Colors.primary} />
              <Text style={[
                styles.logoutButtonText,
                { color: isDarkMode ? Colors.text : Colors.primary }
              ]}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={[
        styles.section, 
        { 
          backgroundColor: isDarkMode ? Colors.darkCard : Colors.card,
          borderWidth: 1,
          borderColor: isDarkMode ? Colors.darkBorder : Colors.border,
        }
      ]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? Colors.darkText : Colors.text }]}>Preferences</Text>
        {renderSettingItem('dark-mode', 'Dark Mode', isDarkMode, toggleTheme, true)}
        {renderSettingItem('notifications', 'Notifications', notifications, () => setNotifications(!notifications), true)}
        {renderSettingItem('location-on', 'Location Services', locationServices, () => setLocationServices(!locationServices), true)}
        {renderSettingItem('language', 'Language', language, () => {}, false)}
      </View>

      <View style={[
        styles.section, 
        { 
          backgroundColor: isDarkMode ? Colors.darkCard : Colors.card,
          borderWidth: 1,
          borderColor: isDarkMode ? Colors.darkBorder : Colors.border,
        }
      ]}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? Colors.darkText : Colors.text }]}>About</Text>
        {renderSettingItem('info', 'App Version', '1.0.0', () => {}, false)}
        {renderSettingItem('privacy-tip', 'Privacy Policy', '', () => {}, false)}
        {renderSettingItem('description', 'Terms of Service', '', () => {}, false)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  headerIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  loginContainer: {
    gap: 20,
  },
  loginTypeToggle: {
    flexDirection: 'row',
    borderRadius: 15,
    padding: 6,
    marginBottom: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  input: {
    borderRadius: 15,
    padding: 18,
    borderWidth: 1,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  loginButton: {
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loggedInContainer: {
    gap: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  profileIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileInfo: {
    flex: 1,
  },
  loggedInText: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  userTypeText: {
    fontSize: 15,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  logoutButton: {
    borderRadius: 15,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 15,
    marginRight: 6,
    letterSpacing: 0.3,
  },
});

export default SettingsScreen; 