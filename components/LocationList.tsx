// app/(drawer)/dashboard/components/LocationList.tsx
import React, { memo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Location } from '../constants/models';

const LocationList = memo(({ locations }: { locations: Location[] }) => (
  <FlatList
    data={locations}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View style={styles.item}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.address}>{item.address}</Text>
      </View>
    )}
    contentContainerStyle={styles.list}
  />
));

const styles = StyleSheet.create({
  list: { paddingBottom: 24 },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  address: { fontSize: 14, color: '#666' },
});

export default LocationList;