import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Plus, Trash, Save, X, Database, ShieldAlert } from 'lucide-react'
import { useQuestionsManager } from '../hooks/useQuestionsManager'
import { useAuth } from '../contexts/AuthContext'

interface Question {
	id: string
	title: string
	points: number | string
	tooltip: string[]
}

interface EditQuestionsComponentProps {
	onClose: () => void
	onSave: (updatedQuestions: any) => void
}

export function EditQuestionsComponent({ onClose, onSave }: EditQuestionsComponentProps) {
	// Get user and role from auth context - fixed to use userData and hasRole
	const { userData, hasRole } = useAuth()
	const hasAccess = hasRole('admin') || hasRole('dziekan')

	const categories = [
		'Publikacje dydaktyczne',
		'Podniesienie jakości nauczania',
		'Zajęcia w języku obcym, wykłady za granicą',
		'Pełnienie funkcji dydaktycznej (za każdy rok)',
		'Nagrody i wyróznienia',
	]

	const [selectedCategory, setSelectedCategory] = useState<string>(categories[0])
	const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
	const [newQuestion, setNewQuestion] = useState<Question>({
		id: '',
		title: '',
		points: 0,
		tooltip: [''],
	})

	// Use the custom hook for all data operations
	const {
		questions,
		loading,
		error,
		fetchQuestions,
		addNewQuestion,
		updateExistingQuestion,
		deleteExistingQuestion,
		addAllQuestionsFromFile,
	} = useQuestionsManager(selectedCategory)

	// If user doesn't have access, show access denied component
	if (!hasAccess) {
		return (
			<div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col mx-2 my-2 overflow-auto">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-semibold text-gray-800">Edycja pytań</h2>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
						<X className="h-5 w-5" />
					</Button>
				</div>
				<div className="flex flex-col items-center justify-center h-full text-center">
					<ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
					<h3 className="text-xl font-semibold text-gray-800 mb-2">Brak dostępu</h3>
					<p className="text-gray-600 max-w-md">
						Tylko użytkownicy z rolą dziekana lub administratora mają dostęp do edycji pytań.
					</p>
					<Button onClick={onClose} className="mt-6 bg-gray-100 text-gray-800 hover:bg-gray-200">
						Powrót
					</Button>
				</div>
			</div>
		)
	}

	// Handle category change
	const handleCategoryChange = (category: string) => {
		setSelectedCategory(category)
		fetchQuestions(category)
	}

	// Obsługa zapisywania wszystkich zmian
	const handleSaveChanges = () => {
		onSave(questions)
		onClose()
	}

	// Obsługa dodawania nowego pytania
	const handleAddQuestion = async () => {
		if (newQuestion.title.trim() === '') return

		await addNewQuestion(newQuestion, selectedCategory)

		// Resetowanie formularza
		setNewQuestion({
			id: '',
			title: '',
			points: 0,
			tooltip: [''],
		})
	}

	// Obsługa aktualizacji pytania
	const handleUpdateQuestion = async () => {
		if (!editingQuestion) return
		await updateExistingQuestion(editingQuestion)
		setEditingQuestion(null)
	}

	// Obsługa dodawania nowej podpowiedzi do pytania
	const handleAddTooltip = () => {
		if (editingQuestion) {
			setEditingQuestion({
				...editingQuestion,
				tooltip: [...editingQuestion.tooltip, ''],
			})
		} else {
			setNewQuestion({
				...newQuestion,
				tooltip: [...newQuestion.tooltip, ''],
			})
		}
	}

	// Obsługa zmiany treści podpowiedzi
	const handleTooltipChange = (index: number, value: string, isEditing: boolean) => {
		if (isEditing && editingQuestion) {
			const updatedTooltips = [...editingQuestion.tooltip]
			updatedTooltips[index] = value
			setEditingQuestion({
				...editingQuestion,
				tooltip: updatedTooltips,
			})
		} else {
			const updatedTooltips = [...newQuestion.tooltip]
			updatedTooltips[index] = value
			setNewQuestion({
				...newQuestion,
				tooltip: updatedTooltips,
			})
		}
	}

	// Obsługa usuwania podpowiedzi
	const handleRemoveTooltip = (index: number, isEditing: boolean) => {
		if (isEditing && editingQuestion) {
			const updatedTooltips = [...editingQuestion.tooltip]
			updatedTooltips.splice(index, 1)
			setEditingQuestion({
				...editingQuestion,
				tooltip: updatedTooltips,
			})
		} else {
			const updatedTooltips = [...newQuestion.tooltip]
			updatedTooltips.splice(index, 1)
			setNewQuestion({
				...newQuestion,
				tooltip: updatedTooltips,
			})
		}
	}

	// Wyświetlanie stanu ładowania, gdy nie ma jeszcze pytań
	if (loading && questions.length === 0) {
		return (
			<div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col mx-0 my-0 overflow-auto">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-semibold text-gray-800">Edycja pytań</h2>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
						<X className="h-5 w-5" />
					</Button>
				</div>
				<div className="flex items-center justify-center h-full">
					<div className="text-gray-500 flex flex-col items-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
						<span>Ładowanie pytań...</span>
					</div>
				</div>
			</div>
		)
	}

	// Główny widok komponentu
	return (
		<div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col mx-0 my-0 text-gray-800">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-semibold text-gray-800">Edycja pytań</h2>
				<Button
					variant="ghost"
					size="icon"
					onClick={onClose}
					className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
					<X className="h-5 w-5" />
				</Button>
			</div>

			{error && (
				<div
					className={`mb-4 p-3 rounded-md ${
						error.includes('Dodano')
							? 'bg-green-50 text-green-600 border border-green-100'
							: 'bg-red-50 text-red-600 border border-red-100'
					}`}>
					{error}
				</div>
			)}

			{/* Wybór kategorii pytań */}
			<div className="mb-6">
				<label className="block text-sm font-medium text-gray-700 mb-2">Wybierz kategorię</label>
				<select
					className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
					value={selectedCategory}
					onChange={e => handleCategoryChange(e.target.value)}>
					{categories.map(category => (
						<option key={category} value={category}>
							{category}
						</option>
					))}
				</select>
			</div>

			<h3 className="text-lg font-semibold mb-4 text-gray-700">Pytania w kategorii: {selectedCategory}</h3>

			{/* Scrollable container for questions */}
			<div className="flex-1 overflow-y-auto mb-4 pr-1">
				<div className="space-y-4 mb-8">
					{questions.map(question => (
						<div
							key={question.id}
							className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
							{editingQuestion?.id === question.id ? (
								// Formularz edycji pytania
								<div className="space-y-3">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Tytuł pytania</label>
										<Input
											value={editingQuestion.title}
											onChange={e => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
											className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Punkty</label>
										<Input
											type="number"
											value={typeof editingQuestion.points === 'string' ? 0 : editingQuestion.points}
											onChange={e => setEditingQuestion({ ...editingQuestion, points: Number(e.target.value) })}
											className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-32"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Podpowiedzi</label>
										{editingQuestion.tooltip.map((tip, index) => (
											<div key={index} className="flex items-center gap-2 mb-2">
												<Textarea
													value={tip}
													onChange={e => handleTooltipChange(index, e.target.value, true)}
													className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
												/>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleRemoveTooltip(index, true)}
													disabled={editingQuestion.tooltip.length <= 1}
													className="text-gray-400 hover:text-red-500 hover:bg-red-50">
													<Trash className="h-4 w-4" />
												</Button>
											</div>
										))}
										<Button
											variant="outline"
											size="sm"
											onClick={handleAddTooltip}
											className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50">
											<Plus className="h-4 w-4 mr-2" /> Dodaj podpowiedź
										</Button>
									</div>
									<div className="flex justify-end gap-2 mt-4">
										<Button
											variant="outline"
											onClick={() => setEditingQuestion(null)}
											className="border-gray-200 hover:bg-gray-50 text-gray-700">
											Anuluj
										</Button>
										<Button onClick={handleUpdateQuestion} className="bg-blue-600 hover:bg-blue-700 text-white">
											Zapisz zmiany
										</Button>
									</div>
								</div>
							) : (
								// Widok pytania (bez edycji)
								<div>
									<div className="flex justify-between">
										<h4 className="font-medium text-gray-800">{question.title}</h4>
										<div className="flex gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setEditingQuestion(question)}
												className="border-gray-200 hover:bg-gray-50 text-gray-700">
												Edytuj
											</Button>
											<Button
												variant="outline"
												size="sm"
												onClick={() => deleteExistingQuestion(question.id)}
												className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
												Usuń
											</Button>
										</div>
									</div>
									<p className="text-sm text-gray-500 mt-1">Punkty: {question.points}</p>
									{question.tooltip.length > 0 && (
										<div className="mt-2">
											<p className="text-sm font-medium text-gray-700">Podpowiedzi:</p>
											<ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
												{question.tooltip.map((tip, index) => (
													<li key={index}>{tip}</li>
												))}
											</ul>
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</div>

				{/* Formularz dodawania nowego pytania */}
				<div className="border-t border-gray-100 pt-6">
					<h3 className="text-lg font-semibold mb-4 text-gray-700">Dodaj nowe pytanie</h3>
					<div className="space-y-3">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Tytuł pytania</label>
							<Input
								value={newQuestion.title}
								onChange={e => setNewQuestion({ ...newQuestion, title: e.target.value })}
								placeholder="Wprowadź tytuł pytania"
								className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Punkty</label>
							<Input
								type="number"
								value={typeof newQuestion.points === 'string' ? 0 : newQuestion.points}
								onChange={e => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })}
								placeholder="Wprowadź liczbę punktów"
								className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-32"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Podpowiedzi</label>
							{newQuestion.tooltip.map((tip, index) => (
								<div key={index} className="flex items-center gap-2 mb-2">
									<Textarea
										value={tip}
										onChange={e => handleTooltipChange(index, e.target.value, false)}
										placeholder="Wprowadź tekst podpowiedzi"
										className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
									/>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleRemoveTooltip(index, false)}
										disabled={newQuestion.tooltip.length <= 1}
										className="text-gray-400 hover:text-red-500 hover:bg-red-50">
										<Trash className="h-4 w-4" />
									</Button>
								</div>
							))}
							<Button
								variant="outline"
								size="sm"
								onClick={handleAddTooltip}
								className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50">
								<Plus className="h-4 w-4 mr-2" /> Dodaj podpowiedź
							</Button>
						</div>
						<Button
							onClick={handleAddQuestion}
							disabled={!newQuestion.title.trim()}
							className="mt-4 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200">
							<Plus className="h-4 w-4 mr-2" /> Dodaj pytanie
						</Button>
					</div>
				</div>
			</div>

			{/* Przyciski akcji na dole komponentu */}
			<div className="flex justify-end gap-4 mt-4 border-t border-gray-100 pt-4">
				<Button
					onClick={() => addAllQuestionsFromFile(selectedCategory)}
					disabled={loading}
					className="mr-auto bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200">
					<Database className="h-4 w-4 mr-2" />
					{loading ? 'Dodawanie pytań...' : 'Dodaj wszystkie pytania z pliku'}
				</Button>
				<Button variant="outline" onClick={onClose} className="border-gray-200 hover:bg-gray-50 text-gray-700">
					Anuluj
				</Button>
				<Button
					onClick={handleSaveChanges}
					className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200">
					<Save className="h-4 w-4 mr-2" /> Zapisz wszystkie zmiany
				</Button>
			</div>
		</div>
	)
}
