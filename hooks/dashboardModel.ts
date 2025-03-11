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
