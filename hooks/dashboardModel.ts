// app/(drawer)/dashboard/viewModel.ts
import { useState } from 'react';
import { Location } from '../constants/models';

const useDashboardViewModel = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic here
  };

  return {
    locations,
    searchQuery,
    handleSearch,
  };
};

export default useDashboardViewModel;