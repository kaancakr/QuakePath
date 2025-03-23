import { useState } from "react";
import { Location } from "../constants/models";

const dummyLocations: Location[] = [
  {
    id: "1",
    name: "Central Park",
    address: "New York, NY, USA",
    latitude: 40.785091,
    longitude: -73.968285,
  },
  {
    id: "2",
    name: "Eiffel Tower",
    address: "Paris, France",
    latitude: 48.858844,
    longitude: 2.294351,
  },
  {
    id: "3",
    name: "Tokyo Tower",
    address: "Tokyo, Japan",
    latitude: 35.658581,
    longitude: 139.745438,
  },
  {
    id: "4",
    name: "Sydney Opera House",
    address: "Sydney, Australia",
    latitude: -33.856784,
    longitude: 151.215297,
  },
  {
    id: "5",
    name: "Great Wall of China",
    address: "China",
    latitude: 40.431908,
    longitude: 116.570374,
  },
  // Türkiye'den konumlar
  {
    id: "6",
    name: "Ayasofya Camii",
    address: "İstanbul, Türkiye",
    latitude: 41.0086,
    longitude: 28.9802,
  },
  {
    id: "7",
    name: "Kapadokya",
    address: "Nevşehir, Türkiye",
    latitude: 38.6431,
    longitude: 34.8288,
  },
  {
    id: "8",
    name: "Pamukkale",
    address: "Denizli, Türkiye",
    latitude: 37.9167,
    longitude: 29.1167,
  },
  {
    id: "9",
    name: "Efes Antik Kenti",
    address: "İzmir, Türkiye",
    latitude: 37.9397,
    longitude: 27.3408,
  },
  {
    id: "10",
    name: "Nemrut Dağı",
    address: "Adıyaman, Türkiye",
    latitude: 37.9811,
    longitude: 38.7406,
  },
  {
    id: "11",
    name: "Galata Kulesi",
    address: "İstanbul, Türkiye",
    latitude: 41.0255,
    longitude: 28.9742,
  },
  {
    id: "12",
    name: "Aspendos Tiyatrosu",
    address: "Antalya, Türkiye",
    latitude: 36.9389,
    longitude: 31.1722,
  },
  {
    id: "13",
    name: "Sumela Manastırı",
    address: "Trabzon, Türkiye",
    latitude: 40.6892,
    longitude: 39.6583,
  },
  {
    id: "14",
    name: "İshak Paşa Sarayı",
    address: "Ağrı, Türkiye",
    latitude: 39.5208,
    longitude: 44.1275,
  },
  {
    id: "15",
    name: "Safranbolu Evleri",
    address: "Karabük, Türkiye",
    latitude: 41.2500,
    longitude: 32.6833,
  },
];

const useDashboardViewModel = () => {
  const [locations, setLocations] = useState<Location[]>(dummyLocations);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filteredLocations = dummyLocations.filter((location) =>
      location.name.toLowerCase().includes(query.toLowerCase())
    );
    setLocations(filteredLocations);
  };

  return {
    locations,
    searchQuery,
    handleSearch,
  };
};

export default useDashboardViewModel;