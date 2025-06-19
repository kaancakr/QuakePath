// dashboardModel.ts
import { useState } from "react";
import { Location } from "../constants/models";

const dummyLocations: Location[] = [
  {
    id: "1",
    name: "Ankara Kızılay Meydanı",
    address: "Çankaya, Ankara",
    latitude: 39.92077,
    longitude: 32.85411,
  },
  {
    id: "2",
    name: "Ankara Güvenpark Meydanı",
    address: "Çankaya, Ankara",
    latitude: 39.92036,
    longitude: 32.85342,
  },
  {
    id: "3",
    name: "Aşıklar Parkı",
    address: "Çankaya, Ankara",
    latitude: 39.90604,
    longitude: 32.87946,
  },
  {
    id: "4",
    name: "Fatih Terim Parkı",
    address: "Çankaya, Ankara",
    latitude: 39.92632,
    longitude: 32.82479,
  },
  {
    id: "5",
    name: "ODTÜ Stadyum Önü",
    address: "Çankaya, Ankara",
    latitude: 39.89090,
    longitude: 32.78605,
  },
  {
    id: "6",
    name: "Cumhuriyet Lisesi Bahçesi",
    address: "Çankaya, Ankara",
    latitude: 39.91971,
    longitude: 32.82198
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