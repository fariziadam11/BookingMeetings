import { Search } from 'lucide-react';

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SearchInput = ({ searchTerm, onSearchChange }: SearchInputProps) => (
  <div className="relative">
    <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      placeholder="Search bookings..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
    />
  </div>
);

export default SearchInput; 