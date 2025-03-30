import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Plus, Trash, Save, X, Database } from 'lucide-react'
import { useQuestionsManager } from '../hooks/useQuestionsManager'

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
		addAllQuestionsFromFile
	} = useQuestionsManager(selectedCategory)

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
			<div className="h-full p-4 lg:p-6 bg-white rounded-lg shadow-lg flex flex-col mx-2 my-2 overflow-auto text-black">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-ubbprimary">Edycja pytań</h2>
					<Button variant="outline" size="icon" onClick={onClose}>
						<X className="h-4 w-4" />
					</Button>
				</div>
				<div className="flex items-center justify-center h-full">
					<p>Ładowanie pytań...</p>
				</div>
			</div>
		)
	}

	// Główny widok komponentu
	return (
		<div className="h-full p-4 lg:p-6 bg-white rounded-lg shadow-lg flex flex-col mx-2 my-2 overflow-auto text-black">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-ubbprimary">Edycja pytań</h2>
				<Button variant="outline" size="icon" onClick={onClose}>
					<X className="h-4 w-4" />
				</Button>
			</div>

			{error && (
				<div className={`mb-4 p-3 ${error.includes('Dodano') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded-md`}>
					{error}
				</div>
			)}

			{/* Wybór kategorii pytań */}
			<div className="mb-6">
				<label className="block text-sm font-medium mb-2">Wybierz kategorię</label>
				<select
					className="w-full p-2 border rounded-md"
					value={selectedCategory}
					onChange={e => handleCategoryChange(e.target.value)}>
					{categories.map(category => (
						<option key={category} value={category}>
							{category}
						</option>
					))}
				</select>
			</div>

			{/* Przycisk do dodania wszystkich pytań z pliku */}
			<div className="mb-4">
				<Button 
					onClick={() => addAllQuestionsFromFile(selectedCategory)} 
					disabled={loading}
					className="w-full bg-blue-600 hover:bg-blue-700"
				>
					<Database className="h-4 w-4 mr-2" /> 
					{loading ? 'Dodawanie pytań...' : 'Dodaj wszystkie pytania z pliku'}
				</Button>
			</div>

			<div className="mb-8">
				<h3 className="text-lg font-semibold mb-4">Pytania w kategorii: {selectedCategory}</h3>

				{/* Lista istniejących pytań */}
				<div className="space-y-4 mb-8">
					{questions.map(question => (
						<div key={question.id} className="p-4 border rounded-lg">
							{editingQuestion?.id === question.id ? (
								// Formularz edycji pytania
								<div className="space-y-3">
									<div>
										<label className="block text-sm font-medium mb-1">Tytuł pytania</label>
										<Input
											value={editingQuestion.title}
											onChange={e => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Punkty</label>
										<Input
											type="number"
											value={typeof editingQuestion.points === 'string' ? 0 : editingQuestion.points}
											onChange={e => setEditingQuestion({ ...editingQuestion, points: Number(e.target.value) })}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium mb-1">Podpowiedzi</label>
										{editingQuestion.tooltip.map((tip, index) => (
											<div key={index} className="flex items-center gap-2 mb-2">
												<Textarea
													value={tip}
													onChange={e => handleTooltipChange(index, e.target.value, true)}
													className="flex-1"
												/>
												<Button
													variant="outline"
													size="icon"
													onClick={() => handleRemoveTooltip(index, true)}
													disabled={editingQuestion.tooltip.length <= 1}>
													<Trash className="h-4 w-4" />
												</Button>
											</div>
										))}
										<Button variant="outline" size="sm" onClick={handleAddTooltip} className="mt-2">
											<Plus className="h-4 w-4 mr-2" /> Dodaj podpowiedź
										</Button>
									</div>
									<div className="flex justify-end gap-2 mt-4">
										<Button variant="outline" onClick={() => setEditingQuestion(null)}>
											Anuluj
										</Button>
										<Button onClick={handleUpdateQuestion}>Zapisz zmiany</Button>
									</div>
								</div>
							) : (
								// Widok pytania (bez edycji)
								<div>
									<div className="flex justify-between">
										<h4 className="font-medium">{question.title}</h4>
										<div className="flex gap-2">
											<Button variant="outline" size="sm" onClick={() => setEditingQuestion(question)}>
												Edytuj
											</Button>
											<Button variant="destructive" size="sm" onClick={() => deleteExistingQuestion(question.id)}>
												Usuń
											</Button>
										</div>
									</div>
									<p className="text-sm text-gray-500 mt-1">Punkty: {question.points}</p>
									{question.tooltip.length > 0 && (
										<div className="mt-2">
											<p className="text-sm font-medium">Podpowiedzi:</p>
											<ul className="list-disc pl-5 text-sm text-gray-600">
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
				<div className="border-t pt-6">
					<h3 className="text-lg font-semibold mb-4">Dodaj nowe pytanie</h3>
					<div className="space-y-3">
						<div>
							<label className="block text-sm font-medium mb-1">Tytuł pytania</label>
							<Input
								value={newQuestion.title}
								onChange={e => setNewQuestion({ ...newQuestion, title: e.target.value })}
								placeholder="Wprowadź tytuł pytania"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Punkty</label>
							<Input
								type="number"
								value={typeof newQuestion.points === 'string' ? 0 : newQuestion.points}
								onChange={e => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })}
								placeholder="Wprowadź liczbę punktów"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium mb-1">Podpowiedzi</label>
							{newQuestion.tooltip.map((tip, index) => (
								<div key={index} className="flex items-center gap-2 mb-2">
									<Textarea
										value={tip}
										onChange={e => handleTooltipChange(index, e.target.value, false)}
										placeholder="Wprowadź tekst podpowiedzi"
										className="flex-1"
									/>
									<Button
										variant="outline"
										size="icon"
										onClick={() => handleRemoveTooltip(index, false)}
										disabled={newQuestion.tooltip.length <= 1}>
										<Trash className="h-4 w-4" />
									</Button>
								</div>
							))}
							<Button variant="outline" size="sm" onClick={handleAddTooltip} className="mt-2">
								<Plus className="h-4 w-4 mr-2" /> Dodaj podpowiedź
							</Button>
						</div>
						<Button onClick={handleAddQuestion} disabled={!newQuestion.title.trim()} className="mt-4">
							<Plus className="h-4 w-4 mr-2" /> Dodaj pytanie
						</Button>
					</div>
				</div>
			</div>

			{/* Przyciski akcji na dole komponentu */}
			<div className="flex justify-end gap-4 mt-8 border-t pt-4">
				<Button variant="outline" onClick={onClose}>
					Anuluj
				</Button>
				<Button onClick={handleSaveChanges}>
					<Save className="h-4 w-4 mr-2" /> Zapisz wszystkie zmiany
				</Button>
			</div>
		</div>
	)
}
