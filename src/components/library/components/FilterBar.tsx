// Update imports
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react'
import { Input } from '../../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Button } from '../../ui/button'
import { useId } from 'react'

// Define proper type for status
type StatusType = 'all' | 'pending' | 'approved' | 'rejected'
type SortFieldType = 'userName' | 'points' | 'status'
type SortDirectionType = 'asc' | 'desc'

interface FilterBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filterStatus: StatusType
  setFilterStatus: (status: StatusType) => void
  sortField: SortFieldType
  setSortField: (field: SortFieldType) => void
  sortDirection: SortDirectionType
  setSortDirection: (direction: SortDirectionType) => void
}

export function FilterBar({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection
}: FilterBarProps) {
  // Generate unique IDs for accessibility
  const searchId = useId()
  const statusId = useId()
  const sortId = useId()
  
  return (
    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <h3 className="text-lg text-black font-medium">Lista zgłoszonych publikacji do oceny</h3>
      
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">Szukaj publikacji</label>
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id={searchId}
            placeholder="Szukaj..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full md:w-64"
            aria-label="Szukaj publikacji"
          />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as StatusType)}
          >
            <SelectTrigger id={statusId} className="w-[130px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="pending">Oczekujące</SelectItem>
              <SelectItem value="approved">Ocenione</SelectItem>
              <SelectItem value="rejected">Odrzucone</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={sortField}
            onValueChange={(value) => setSortField(value as SortFieldType)}
          >
            <SelectTrigger id={sortId} className="w-[130px]">
              {sortDirection === 'asc' ? (
                <SortAsc className="h-4 w-4 mr-2" />
              ) : (
                <SortDesc className="h-4 w-4 mr-2" />
              )}
              <SelectValue placeholder="Sortuj" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="userName">Nazwa użytkownika</SelectItem>
              <SelectItem value="points">Punkty</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            title={`Sortuj ${sortDirection === 'asc' ? 'malejąco' : 'rosnąco'}`}
            aria-label={`Sortuj ${sortDirection === 'asc' ? 'malejąco' : 'rosnąco'}`}
          >
            {sortDirection === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}