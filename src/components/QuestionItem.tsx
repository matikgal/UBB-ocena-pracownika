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
    <div className={`bg-white p-4 rounded-lg shadow border-2 ${checked ? 'border-green-500 bg-green-50' : 'border-gray-200'} transition-all`}>
      <div className="flex items-start gap-4">
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
              className={`text-sm font-medium leading-tight cursor-pointer transition-colors ${checked ? 'text-green-700' : 'text-gray-800'}`}
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
        <TooltipTrigger className="inline-flex cursor-help">
          <GoInfo className="text-gray-400 hover:text-gray-600 transition-colors" />
        </TooltipTrigger>
        <TooltipContent 
          side="left" 
          align="start" 
          className="max-w-[200px] bg-white shadow-lg p-3 rounded-md z-50 border border-gray-200"
          sideOffset={5}
          hideArrow
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
  onValueChange 
}: { 
  points: number | string, 
  checked: boolean, 
  value: string, 
  onValueChange: (value: string) => void 
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
          <Input
            type="number"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="w-20 h-8 text-sm text-black rounded-md border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            placeholder="Punkty"
          />
          <span className="text-sm font-medium text-green-600">
            Wybrano
          </span>
        </div>
      )}
    </div>
  );
}