// QuestionsComponent.tsx
import {
	publikacjeDydaktyczne,
	podniesienieJakosciNauczania,
	zajeciaJezykObcy,
	funkcjeDydaktyczne,
	nagrodyWyroznienia,
} from '../lib/questions'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'

import { GoInfo } from 'react-icons/go'

// Define the shape of a question
interface Question {
	id: string
	title: string
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

	return (
		<div className="p-6 bg-white rounded-b-3xl shadow-md mx-auto h-[calc(100vh-160px)] flex flex-col overflow-hidden">
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
											<GoInfo className="scale-75 ml-2" />
										</TooltipTrigger>
										<TooltipContent>
											<p>{question.tooltip}</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<p className="font-thin text-lg">Maksymalna ilość punktów ({question.points})</p>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
