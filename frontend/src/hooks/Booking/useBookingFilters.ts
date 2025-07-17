import { useState, useCallback } from 'react';
import type { FilterType } from '../../types/booking';

const useBookingFilters = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const resetFilters = useCallback(() => {
    setFilter('all');
    setSearchTerm('');
  }, []);

  return {
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    resetFilters
  };
};

export default useBookingFilters; 