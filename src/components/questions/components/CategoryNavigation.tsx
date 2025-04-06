import { Button } from '../../ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CategoryNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  isFirstCategory: boolean;
  isLastCategory: boolean;
}

export default function CategoryNavigation({
  onPrevious,
  onNext,
  isFirstCategory,
  isLastCategory,
}: CategoryNavigationProps) {
  return (
    <div className="flex gap-3 text-gray-700">
      <Button 
        onClick={onPrevious} 
        disabled={isFirstCategory} 
        variant="outline" 
        className={`flex items-center gap-2 border-gray-200 ${isFirstCategory ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
      >
        <ChevronLeft className="h-4 w-4" />
        Poprzednia
      </Button>

      <Button 
        onClick={onNext} 
        disabled={isLastCategory} 
        variant="outline" 
        className={`flex items-center gap-2 border-gray-200 ${isLastCategory ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
      >
        Następna
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}