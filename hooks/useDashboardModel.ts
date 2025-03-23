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
    name: "İstanbul Taksim Meydanı",
    address: "Beyoğlu, İstanbul",
    latitude: 41.03508,
    longitude: 28.98371,
  },
  {
    id: "3",
    name: "İzmir Saat Kulesi",
    address: "Konak, İzmir",
    latitude: 38.41996,
    longitude: 27.12872,
  },
  {
    id: "4",
    name: "Antalya Kaleiçi",
    address: "Muratpaşa, Antalya",
    latitude: 36.88529,
    longitude: 30.70316,
  },
  {
    id: "5",
    name: "Bursa Uludağ Kayak Merkezi",
    address: "Bursa",
    latitude: 40.07173,
    longitude: 29.22447,
  },
  {
    id: "6",
    name: "Meşrutiyet Street",
    address: "Kızılay, Ankara",
    latitude: 39.9175,
    longitude: 32.8542
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