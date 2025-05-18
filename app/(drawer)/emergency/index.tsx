import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import * as Location from 'expo-location';

const emergencyMessages = [
  {
    id: 1,
    title: 'Yardıma İhtiyacım Var',
    message: 'Deprem sonrası yardıma ihtiyacım var. Konumum: ',
    icon: 'help',
  },
  {
    id: 2,
    title: 'Enkaz Altındayım',
    message: 'Enkaz altındayım. Acil yardım gerekiyor. Konumum: ',
    icon: 'warning',
  },
  {
    id: 3,
    title: 'Güvenli Bölgedeyim',
    message: 'Güvenli bir bölgedeyim. Ailem ve arkadaşlarım beni arıyorsa bilgilendirilmelerini rica ederim.',
    icon: 'check-circle',
  },
  {
    id: 4,
    title: 'Tıbbi Yardım Gerekiyor',
    message: 'Tıbbi yardıma ihtiyacım var. Konumum: ',
    icon: 'medical-services',
  },
];

const EmergencyScreen = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Hata', 'Konum izni gerekli');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      return `${location.coords.latitude}, ${location.coords.longitude}`;
    } catch (error) {
      console.error('Konum alınamadı:', error);
      return null;
    }
  };

  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    try {
      const location = await getCurrentLocation();
      const fullMessage = location ? `${message}${location}` : message;
      
      // Burada mesh network entegrasyonu yapılacak
      Alert.alert(
        'Bilgi',
        'Mesajınız gönderildi. Mesh network sistemi hazır olduğunda mesajınız iletilecektir.',
        [{ text: 'Tamam', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="emergency" size={32} color={Colors.red} />
        <Text style={styles.title}>Acil Durum Mesajları</Text>
      </View>

      <Text style={styles.description}>
        Aşağıdaki hazır mesajlardan birini seçerek acil durum bildirimi gönderebilirsiniz.
      </Text>

      {emergencyMessages.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.messageCard, isLoading && styles.disabledCard]}
          onPress={() => handleSendMessage(item.message)}
          disabled={isLoading}
        >
          <MaterialIcons name={item.icon as any} size={24} color={Colors.red} />
          <View style={styles.messageContent}>
            <Text style={styles.messageTitle}>{item.title}</Text>
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
          <MaterialIcons name="send" size={24} color={Colors.primary} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  description: {
    fontSize: 16,
    color: Colors.grey,
    marginBottom: 24,
    lineHeight: 24,
  },
  messageCard: {
    backgroundColor: Colors.light,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.grey + '40',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledCard: {
    opacity: 0.5,
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: Colors.grey,
  },
});

export default EmergencyScreen; 