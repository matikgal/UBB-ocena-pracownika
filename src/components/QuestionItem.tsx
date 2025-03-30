import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { GoInfo } from 'react-icons/go'
import { Checkbox } from './ui/checkbox'
import { Input } from './ui/input'

interface Question {
  id: string
  title: string
  points: number | string
  tooltip: string[]
}

interface QuestionItemProps {
  question: Question
  checked: boolean
  value: string
  onCheckChange: () => void
  onValueChange: (value: string) => void
}

export function QuestionItem({ 
  question, 
  checked, 
  value, 
  onCheckChange, 
  onValueChange 
}: QuestionItemProps) {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm mb-4 text-black ${checked ? 'border-l-4 border-green-500' : ''}`}>
      <div className="flex items-start gap-3">
        <Checkbox 
          id={`question-${question.id}`} 
          checked={checked}
          onCheckedChange={onCheckChange}
          className="mt-1"
        />
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <label 
              htmlFor={`question-${question.id}`}
              className={`text-sm font-medium leading-tight cursor-pointer ${checked ? 'text-green-700' : ''}`}
            >
              {question.title}
            </label>
            
            <QuestionTooltip tooltip={question.tooltip} />
          </div>
          
          <QuestionPoints 
            points={question.points} 
            checked={checked} 
            value={value} 
            onValueChange={onValueChange} 
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
        <TooltipTrigger asChild>
          <div className="p-1 cursor-help">
            <GoInfo className="text-gray-400 hover:text-gray-600" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <ul className="list-disc pl-4 text-xs">
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
  onValueChange 
}: { 
  points: number | string, 
  checked: boolean, 
  value: string, 
  onValueChange: (value: string) => void 
}) {
  return (
    <div className="mt-2 flex items-center text-black">
      <span className="text-sm mr-2">
        {typeof points === 'number' 
          ? `${points} pkt` 
          : points}
      </span>
      
      {checked && (
        <div className="flex items-center">
          <Input
            type="number"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="w-20 h-8 text-sm"
            placeholder="Punkty"
          />
          <span className="ml-2 text-sm text-green-600">
            Wybrano
          </span>
        </div>
      )}
    </div>
  );
}