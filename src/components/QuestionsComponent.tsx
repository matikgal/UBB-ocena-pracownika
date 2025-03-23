import {
	publikacjeDydaktyczne,
	podniesienieJakosciNauczania,
	zajeciaJezykObcy,
	funkcjeDydaktyczne,
	nagrodyWyroznienia,
} from '../lib/questions'

import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from './ui/pagination'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'
import { GoInfo } from 'react-icons/go'

interface Question {
	id: string
	title: string
	points: number | string
	tooltip: string
}

interface QuestionsComponentProps {
	selectedCategory: string
}

export default function QuestionsComponent({ selectedCategory }: QuestionsComponentProps) {
	const categoryMap: Record<string, Question[]> = {
		'Publikacje dykaktyczne': publikacjeDydaktyczne,
		'Podniesienie jakości nauczania': podniesienieJakosciNauczania,
		'Zajęcia w języku obcym, wykłady za granicą': zajeciaJezykObcy,
		'Pełnienie funkcji dydaktycznej (za każdy rok)': funkcjeDydaktyczne,
		'Nagrody i wyróznienia': nagrodyWyroznienia,
	}

	const questions = categoryMap[selectedCategory] || publikacjeDydaktyczne

	// Utwórz jedną tablicę wszystkich pytań ze wszystkich kategorii
	const allQuestions: Question[] = Object.values(categoryMap).flat()

	// Sprawdź, czy tooltip zawiera tylko liczby (całkowite lub z przecinkiem)
	const isTooltipOnlyNumbers = (tooltip: string): boolean => {
		return /^\d+(,\d+)?$/.test(tooltip)
	}

	// Znajdź pytanie na podstawie wartości tooltipa (traktowanej jako ID)
	const findQuestionByTooltip = (tooltip: string): Question | undefined => {
		return allQuestions.find(q => q.id === tooltip)
	}

	return (
		<div className="p-6 bg-white rounded-b-3xl  h-[calc(100vh-160px)] flex flex-col overflow-hidden my-2 mx-2  rounded-lg shadow-lg">
			<h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">{selectedCategory}</h2>
			<div className="overflow-y-auto flex-grow">
				<ul className="list-decimal pl-6 space-y-3">
					{questions.map(question => (
						<li key={question.id} className="text-gray-700 flex flex-col text-xl">
							<div className="flex items-center">
								<span className="font-bold text-blue-500 mr-2">{question.id}</span> {question.title}
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger>
											<GoInfo className="scale-75" />
										</TooltipTrigger>
										<TooltipContent>
											{isTooltipOnlyNumbers(question.tooltip) ? (
												// Jeśli tooltip jest liczbą, znajdź powiązane pytanie
												findQuestionByTooltip(question.tooltip) ? (
													<p>{findQuestionByTooltip(question.tooltip)?.title}</p>
												) : (
													// Jeśli nie znaleziono, wyświetl oryginalny tooltip
													<p>{question.tooltip}</p>
												)
											) : (
												// Jeśli tooltip nie jest liczbą, wyświetl go
												<p>{question.tooltip}</p>
											)}
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<p className="font-thin text-lg">Punktacja ({question.points})</p>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
