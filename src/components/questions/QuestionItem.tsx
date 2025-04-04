import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { GoInfo } from 'react-icons/go'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Trash, BookOpen } from 'lucide-react'
import { Button } from '../ui/button'

interface Question {
  id: string
  title: string
  points: number | string
  tooltip: string[]
  status?: 'pending' | 'approved' | 'rejected'
  isLibraryEvaluated?: boolean // New field to identify library-evaluated questions
}

interface QuestionItemProps {
  question: Question
  checked: boolean
  value: string
  onCheckChange: () => void
  onValueChange: (value: string) => void
  onDelete?: (questionId: string) => void
}

export function QuestionItem({ 
  question, 
  checked, 
  value, 
  onCheckChange, 
  onValueChange,
  onDelete
}: QuestionItemProps) {
 
  
  // Determine border and background color based on status
  const getBorderAndBgColor = () => {
    if (!checked) return 'border-gray-200 bg-white';
    
    if (question.status) {
      switch (question.status) {
        case 'approved':
          return 'border-green-500 bg-green-50';
        case 'rejected':
          return 'border-red-500 bg-red-50';
        case 'pending':
          return 'border-amber-500 bg-amber-50';
      }
    }
    
    return 'border-blue-500 bg-blue-50';
  };

  // Determine if editing is disabled (when approved)
  const isEditingDisabled = question.status === 'approved';
  
  // Check if this is the library-evaluated question
  const isLibraryQuestion = question.isLibraryEvaluated || 
    question.title === "Autorstwo artykułu/monografii (dotyczy pracowników dydaktycznych)";

  return (
    <div 
      className={`p-4 rounded-lg shadow border-2 ${getBorderAndBgColor()} transition-all ${isEditingDisabled ? 'cursor-default' : 'cursor-pointer'}`}
      onClick={(e) => {
        // Prevent triggering if clicking on input, tooltip, or if editing is disabled
        if (
          isEditingDisabled ||
          e.target instanceof HTMLInputElement || 
          (e.target instanceof Element && (
            e.target.closest('.cursor-help') || 
            e.target.closest('input') ||
            e.target.closest('button')
          ))
        ) {
          return;
        }
        onCheckChange();
      }}
    >
      <div className="flex items-start gap-4 ">
        <Checkbox 
          id={`question-${question.id}`} 
          checked={question.status === 'approved' ? true : checked}
          onCheckedChange={() => !isEditingDisabled && onCheckChange()}
          className="mt-1 cursor-pointer"
          disabled={isEditingDisabled}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <label 
              htmlFor={`question-${question.id}`}
              className={`text-sm font-medium leading-tight ${isEditingDisabled ? 'cursor-default' : 'cursor-pointer'} transition-colors ${
                question.status === 'approved' ? 'text-green-700' : 
                question.status === 'rejected' ? 'text-red-700' :
                question.status === 'pending' ? 'text-amber-700' :
                checked ? 'text-green-700' : 'text-gray-800'
              }`}
            >
              {question.title}
              {isLibraryQuestion && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Oceniane przez bibliotekę
                </span>
              )}
            </label>
            
            <div className="flex items-center gap-2">
              <QuestionTooltip tooltip={question.tooltip} />
              
              {/* Library icon for library-evaluated questions */}
              {isLibraryQuestion && (
                <span className="text-blue-500">
                  <BookOpen className="h-4 w-4" />
                </span>
              )}
              
              {/* Status indicator */}
              {question.status && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  question.status === 'approved' ? 'bg-green-100 text-green-800' :
                  question.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {question.status === 'approved' ? 'Zatwierdzone' :
                   question.status === 'rejected' ? 'Odrzucone' : 'Oczekujące'}
                </span>
              )}
              
              {/* Only show delete button for checked items that are not approved */}
              {checked && !isEditingDisabled && onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(question.id);
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-6 w-6"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <QuestionPoints 
            points={question.points} 
            checked={checked} 
            value={value} 
            onValueChange={onValueChange}
            disabled={isEditingDisabled}
            isLibraryEvaluated={isLibraryQuestion}
          />
        </div>
      </div>
    </div>
  )
}

function QuestionTooltip({ tooltip }: { tooltip: string[] }) {
  if (!tooltip || tooltip.length === 0) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="inline-flex cursor-help">
          <GoInfo className="text-gray-400 hover:text-gray-600 transition-colors" />
        </TooltipTrigger>
        <TooltipContent 
          side="left" 
          align="start" 
          className="max-w-[200px] bg-white shadow-lg p-3 rounded-md z-50 border border-gray-200"
          sideOffset={5}
         
        >
          <ul className="list-disc pl-4 text-xs space-y-1.5 text-gray-800">
            {tooltip.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function QuestionPoints({ 
  points, 
  checked, 
  value, 
  onValueChange,
  disabled = false,
  isLibraryEvaluated = false
}: { 
  points: number | string, 
  checked: boolean, 
  value: string, 
  onValueChange: (value: string) => void,
  disabled?: boolean,
  isLibraryEvaluated?: boolean
}) {
  return (
    <div className="mt-3 flex items-center">
      <span className="text-sm text-gray-600 mr-3 font-medium">
        {typeof points === 'number' 
          ? `${points} pkt` 
          : points}
      </span>
      
      {checked && (
        <div className="flex items-center gap-2">
          {isLibraryEvaluated ? (
            <div className="text-sm text-blue-600">
              {value === '0' ? 
                'Oczekuje na ocenę biblioteki' : 
                `Przyznane punkty: ${value}`}
            </div>
          ) : (
            <Input
              type="number"
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              className={`w-20 h-8 text-sm text-black rounded-md border-gray-200 
                ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-green-500 focus:ring-1 focus:ring-green-500'}`}
              placeholder="Punkty"
              min={0}
              step={0.5}
              disabled={disabled}
            />
          )}
        </div>
      )}
    </div>
  );
}