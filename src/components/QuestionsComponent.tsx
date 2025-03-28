import {
	publikacjeDydaktyczne,
	podniesienieJakosciNauczania,
	zajeciaJezykObcy,
	funkcjeDydaktyczne,
	nagrodyWyroznienia,
} from '../lib/questions'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'
import { GoInfo } from 'react-icons/go'
import { Checkbox } from '../components/ui/checkbox'
import { Input } from '../components/ui/input'
import { useState } from 'react'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Question {
	id: string
	title: string
	points: number | string
	tooltip: string[]
}

interface QuestionsComponentProps {
	selectedCategory: string
	onPreviousCategory: () => void
	onNextCategory: () => void
	categories: string[]
}

interface QuestionState {
	checked: boolean
	value: string
}

export default function QuestionsComponent({
	selectedCategory,
	onPreviousCategory,
	onNextCategory,
	categories,
}: QuestionsComponentProps) {
	const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({})

	const categoryMap: Record<string, Question[]> = {
		'Publikacje dydaktyczne': publikacjeDydaktyczne,
		'Podniesienie jakości nauczania': podniesienieJakosciNauczania,
		'Zajęcia w języku obcym, wykłady za granicą': zajeciaJezykObcy,
		'Pełnienie funkcji dydaktycznej (za każdy rok)': funkcjeDydaktyczne,
		'Nagrody i wyróznienia': nagrodyWyroznienia,
	}

	const questions = categoryMap[selectedCategory] || nagrodyWyroznienia

	const currentIndex = categories?.indexOf(selectedCategory) ?? -1
	const isFirstCategory = currentIndex === 0 || !categories
	const isLastCategory = categories ? currentIndex === categories.length - 1 : true

	const handleCheckboxChange = (questionId: string) => {
		setQuestionStates(prev => ({
			...prev,
			[questionId]: {
				...prev[questionId],
				checked: !prev[questionId]?.checked,
			},
		}))
	}

	const handleValueChange = (questionId: string, value: string) => {
		setQuestionStates(prev => ({
			...prev,
			[questionId]: {
				...prev[questionId],
				value,
			},
		}))
	}

	// Update the return statement in QuestionsComponent

	return (
		<div className="h-full p-4 lg:p-6 bg-white rounded-lg shadow-lg flex flex-col mx-2 my-2 overflow-hidden">
			<h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-4 lg:mb-6 border-b-2 border-ubbprimary pb-2">
				{selectedCategory}
			</h2>
			<div className="overflow-y-auto flex-grow pr-2 custom-scrollbar">
				<ul className="space-y-3 lg:space-y-4">
					{questions.map(question => (
						<li key={question.id} className="bg-gray-50 rounded-lg p-3 lg:p-4 hover:bg-gray-100 transition-colors">
							<div className="flex items-start space-x-3 lg:space-x-4">
								<Checkbox
									id={`checkbox-${question.id}`}
									checked={questionStates[question.id]?.checked || false}
									onCheckedChange={() => handleCheckboxChange(question.id)}
									className="mt-1"
								/>
								<div className="flex-1">
									<div className="flex items-center flex-wrap">
										<span className="font-bold text-ubbprimary mr-2 text-sm lg:text-base">{question.id}</span>
										<span className="text-gray-700 text-sm lg:text-base">{question.title}</span>

										{question.tooltip.length > 0 && (
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger>
														<GoInfo className="scale-75 ml-2 text-gray-400" />
													</TooltipTrigger>
													<TooltipContent>
														{question.tooltip.map((tooltipItem, index) => (
															<p key={index}>{tooltipItem}</p>
														))}
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										)}
									</div>
									<div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
										<p className="text-xs lg:text-sm text-gray-500">Maksymalna ilość punktów: {question.points}</p>
										{questionStates[question.id]?.checked && (
											<div className="flex items-center space-x-2">
												<Input
													type="number"
													value={questionStates[question.id]?.value || ''}
													onChange={e => handleValueChange(question.id, e.target.value)}
													className="w-20 lg:w-24 h-7 lg:h-8 text-xs lg:text-sm"
													min="0"
													max={question.points}
													placeholder="0"
												/>
												<span className="text-xs lg:text-sm text-gray-500">/ {question.points}</span>
											</div>
										)}
									</div>
								</div>
							</div>
						</li>
					))}
				</ul>
			</div>
			<div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
				<Button
					variant="outline"
					onClick={onPreviousCategory}
					disabled={isFirstCategory}
					className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
						isFirstCategory
							? 'text-gray-400 border-gray-200'
							: 'text-ubbprimary border-ubbprimary hover:bg-ubbprimary/10'
					}`}>
					<ChevronLeft className="h-4 w-4" />
					Poprzednia kategoria
				</Button>
				<div className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
					{currentIndex + 1} z {categories?.length ?? 0}
				</div>
				<Button
					variant="outline"
					onClick={onNextCategory}
					disabled={isLastCategory}
					className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
						isLastCategory
							? 'text-gray-400 border-gray-200'
							: 'text-ubbprimary border-ubbprimary hover:bg-ubbprimary/10'
					}`}>
					Następna kategoria
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
