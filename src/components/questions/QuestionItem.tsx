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
  isLibraryEvaluated?: boolean
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
 
  // Określenie koloru obramowania i tła na podstawie statusu
  const getBorderAndBgColor = () => {
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
    
    if (checked) {
      return 'border-blue-500 bg-blue-50';
    }
    
    return 'border-gray-200 bg-white';
  };

  // Sprawdzenie czy edycja jest wyłączona (gdy pytanie jest zatwierdzone)
  const isEditingDisabled = question.status === 'approved';
  
  // Sprawdzenie czy to pytanie oceniane przez bibliotekę
  const isLibraryQuestion = question.isLibraryEvaluated || 
    question.title === "Autorstwo artykułu/monografii (dotyczy pracowników dydaktycznych)";

  // Określenie czy checkbox powinien być zaznaczony
  const isChecked = question.status === 'approved' || question.status === 'pending' || checked;

  return (
    <div 
      className={`p-4 rounded-lg shadow border-2 ${getBorderAndBgColor()} transition-all ${isEditingDisabled ? 'cursor-default' : 'cursor-pointer'}`}
      onClick={(e) => {
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
        {/* Checkbox do zaznaczania pytania */}
        <Checkbox 
          id={`question-${question.id}`} 
          checked={isChecked}
          onCheckedChange={() => !isEditingDisabled && onCheckChange()}
          className="mt-1 cursor-pointer"
          disabled={isEditingDisabled}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
        
        <div className="flex-1">
          <div className="flex items-start justify-between text-black">
            {/* Tytuł pytania */}
            <label 
              htmlFor={`question-${question.id}`}
              className={`text-sm font-medium leading-tight cursor-pointer ${isEditingDisabled ? 'cursor-default' : ''}`}
            >
              {question.title}
              
              {/* Ikona dla pytań ocenianych przez bibliotekę */}
              {isLibraryQuestion && (
                <span className="ml-2 inline-flex items-center">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </span>
              )}
              
              {/* Etykiety statusu */}
              {question.status && (
                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${question.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    question.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-amber-100 text-amber-800'}`}>
                  {question.status === 'approved' ? 'Zatwierdzone' : 
                   question.status === 'rejected' ? 'Odrzucone' : 'Oczekujące'}
                </span>
              )}
            </label>
            
            {/* Podpowiedź dla pytania */}
            {question.tooltip && question.tooltip.length > 0 && question.tooltip[0] !== '' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help" onClick={(e) => e.stopPropagation()}>
                      <GoInfo className="h-4 w-4 text-blue-500" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm bg-white p-3 shadow-lg rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-700">
                      {question.tooltip.map((tip, index) => (
                        <p key={index} className="mb-1">{tip}</p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {/* Pole wprowadzania punktów */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center">
              <Input
                type="number"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className="w-20 h-8 text-sm text-black"
                disabled={isEditingDisabled || isLibraryQuestion}
                onClick={(e) => e.stopPropagation()}
                min="0"
                step={0.5}
              />
              <span className="ml-2 text-sm text-gray-600">punktów</span>
            </div>
            
            {/* Przycisk usuwania - widoczny dla wszystkich odpowiedzi oprócz zatwierdzonych */}
            {question.status !== 'approved' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-black hover:text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDelete) {
                    onDelete(question.id);
                  }
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}