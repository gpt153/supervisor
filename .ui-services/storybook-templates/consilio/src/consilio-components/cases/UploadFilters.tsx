import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter, ArrowUpDown } from 'lucide-react';
import type { FileTypeFilter, SortOption } from '@/hooks/useUploadFilters';

interface UploadFiltersProps {
  filter: FileTypeFilter;
  onFilterChange: (filter: FileTypeFilter) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterCounts: Record<FileTypeFilter, number>;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const filterOptions: { value: FileTypeFilter; label: string }[] = [
  { value: 'all', label: 'Alla filer' },
  { value: 'document', label: 'Dokument' },
  { value: 'audio', label: 'Ljud' },
  { value: 'email', label: 'E-post' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'date-desc', label: 'Nyast först' },
  { value: 'date-asc', label: 'Äldst först' },
  { value: 'name-asc', label: 'Namn (A-Ö)' },
  { value: 'size-desc', label: 'Storlek (störst)' },
];

export function UploadFilters({
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  filterCounts,
  onClearFilters,
  hasActiveFilters,
}: UploadFiltersProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left side: Filter and Sort */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(v) => onFilterChange(v as FileTypeFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label} ({filterCounts[option.value]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Rensa
          </Button>
        )}
      </div>

      {/* Right side: Search */}
      <div className="relative w-full sm:w-[250px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Sök filnamn..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
