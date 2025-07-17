import { useMemo } from 'react';
import { Filter } from 'lucide-react';
import type { BookingStats, FilterType } from '../../types/booking';

interface FilterTab {
  key: FilterType;
  label: string;
  count: number;
}

interface FilterTabsProps {
  bookingStats: BookingStats;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterTabs = ({ bookingStats, filter, onFilterChange }: FilterTabsProps) => {
  const tabs: FilterTab[] = useMemo(() => [
    { key: 'all', label: 'All', count: bookingStats.total },
    { key: 'pending', label: 'Pending', count: bookingStats.pending },
    { key: 'approved', label: 'Approved', count: bookingStats.approved },
    { key: 'rejected', label: 'Rejected', count: bookingStats.rejected },
  ], [bookingStats]);

  return (
    <div className="flex items-center space-x-4">
      <Filter className="h-5 w-5 text-gray-400" />
      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterTabs; 