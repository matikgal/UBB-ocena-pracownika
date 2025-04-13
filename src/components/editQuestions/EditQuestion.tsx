import { useState } from 'react'
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { db } from 'firebase'

interface EditQuestionProps {
	categoryId: string
	questionId?: string
	initialData?: {
		id: string
		title: string
		points: number | string
		tooltip: string[]
	}
	onSave?: () => void
	onCancel?: () => void
}

export default function EditQuestion({ categoryId, questionId, initialData, onSave, onCancel }: EditQuestionProps) {
	const [title, setTitle] = useState(initialData?.title || '')
	const [points, setPoints] = useState<number | string>(initialData?.points || 0)
	const [tooltips, setTooltips] = useState<string[]>(initialData?.tooltip || [''])
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleAddTooltip = () => {
		setTooltips([...tooltips, ''])
	}

	const handleRemoveTooltip = (index: number) => {
		const newTooltips = [...tooltips]
		newTooltips.splice(index, 1)
		setTooltips(newTooltips)
	}

	const handleTooltipChange = (index: number, value: string) => {
		const newTooltips = [...tooltips]
		newTooltips[index] = value
		setTooltips(newTooltips)
	}

	const handleSave = async () => {
		try {
			setIsLoading(true)
			setError(null)

			// Validate inputs
			if (!title.trim()) {
				setError('Tytuł jest wymagany')
				return
			}

			if (isNaN(Number(points)) && typeof points !== 'string') {
				setError('Punkty muszą być liczbą lub zakresem')
				return
			}

			// Prepare data for Firestore
			const questionData = {
				title,
				points,
				tooltip: tooltips.filter(t => t.trim() !== ''),
				categoryId,
				updatedAt: new Date(),
			}

			// Save to Firestore
			if (questionId) {
				// Update existing question
				await updateDoc(doc(db, 'questions', questionId), questionData)
			} else {
				// Add new question
				await addDoc(collection(db, 'questions'), {
					...questionData,
					createdAt: new Date(),
				})
			}

			// Call onSave callback if provided
			if (onSave) {
				onSave()
			}
		} catch (err) {
			console.error('Error saving question:', err)
			setError('Wystąpił błąd podczas zapisywania pytania')
		} finally {
			setIsLoading(false)
		}
	}

	const handleDelete = async () => {
		if (!questionId) return

		if (window.confirm('Czy na pewno chcesz usunąć to pytanie?')) {
			try {
				setIsLoading(true)
				await deleteDoc(doc(db, 'questions', questionId))
				if (onSave) onSave() // Refresh the list
			} catch (err) {
				console.error('Error deleting question:', err)
				setError('Wystąpił błąd podczas usuwania pytania')
			} finally {
				setIsLoading(false)
			}
		}
	}

	return (
		<div className="space-y-4  bg-white rounded-lg shadow">
			<h2 className="text-xl font-semibold">{questionId ? 'Edytuj pytanie' : 'Dodaj nowe pytanie'}</h2>

			{error && <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200">{error}</div>}

			<div className="space-y-2">
				<label className="block text-sm font-medium">Tytuł pytania</label>
				<Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Wprowadź tytuł pytania" />
			</div>

			<div className="space-y-2">
				<label className="block text-sm font-medium">Punkty</label>
				<Input value={points} onChange={e => setPoints(e.target.value)} placeholder="Np. 5 lub 1-3" />
			</div>

			<div className="space-y-2">
				<label className="block text-sm font-medium">Podpowiedzi</label>
				{tooltips.map((tooltip, index) => (
					<div key={index} className="flex gap-2">
						<Textarea
							value={tooltip}
							onChange={e => handleTooltipChange(index, e.target.value)}
							placeholder="Wprowadź podpowiedź"
							className="flex-1"
						/>
						<Button
							variant="outline"
							size="icon"
							onClick={() => handleRemoveTooltip(index)}
							disabled={tooltips.length === 1}>
							✕
						</Button>
					</div>
				))}
				<Button variant="outline" onClick={handleAddTooltip}>
					Dodaj podpowiedź
				</Button>
			</div>

			<div className="flex justify-between pt-4">
				<div>
					{questionId && (
						<Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
							Usuń
						</Button>
					)}
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={onCancel} disabled={isLoading}>
						Anuluj
					</Button>
					<Button onClick={handleSave} disabled={isLoading}>
						{isLoading ? 'Zapisywanie...' : 'Zapisz'}
					</Button>
				</div>
			</div>
		</div>
	)
}
