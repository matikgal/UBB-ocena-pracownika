
import { useState, useEffect } from 'react'
import { fetchQuestionsByCategory, addQuestion, updateQuestion, deleteQuestion } from './questionsService'
import { allQuestions } from '../../lib/questions'
import { Question } from '../../types'

export function useQuestionsManager(initialCategory: string) {
  // Inicjalizacja stanów
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Pobieranie pytań przy montowaniu komponentu lub zmianie kategorii
  useEffect(() => {
    fetchQuestions(initialCategory)
  }, [initialCategory])

  // Pobieranie pytań dla konkretnej kategorii
  const fetchQuestions = async (category: string) => {
    try {
      setLoading(true)
      const fetchedQuestions = await fetchQuestionsByCategory(category)
      setQuestions(fetchedQuestions)
      setError(null)
    } catch (err) {
      console.error('Error fetching questions:', err)
      setError('Nie udało się pobrać pytań')
    } finally {
      setLoading(false)
    }
  }

  // Dodawanie nowego pytania
  const addNewQuestion = async (question: Question, category: string) => {
    if (question.title.trim() === '') return null

    try {
      const questionToAdd = {
        title: question.title,
        points: question.points,
        tooltip: question.tooltip,
        category: category
      }

      const newId = await addQuestion(questionToAdd)
      
      // Aktualizacja stanu lokalnego
      setQuestions([...questions, { ...question, id: newId }])
      return newId
    } catch (err) {
      console.error('Error adding question:', err)
      setError('Nie udało się dodać pytania')
      return null
    }
  }

  // Aktualizacja istniejącego pytania
  const updateExistingQuestion = async (question: Question) => {
    try {
      const questionToUpdate = {
        title: question.title,
        points: question.points,
        tooltip: question.tooltip
      }

      await updateQuestion(question.id, questionToUpdate)
      
      // Aktualizacja stanu lokalnego
      setQuestions(questions.map(q => 
        q.id === question.id ? question : q
      ))
      
      return true
    } catch (err) {
      console.error('Error updating question:', err)
      setError('Nie udało się zaktualizować pytania')
      return false
    }
  }

  // Usuwanie pytania
  const deleteExistingQuestion = async (id: string) => {
    try {
      await deleteQuestion(id)
      // Aktualizacja stanu lokalnego
      setQuestions(questions.filter(q => q.id !== id))
      return true
    } catch (err) {
      console.error('Error deleting question:', err)
      setError('Nie udało się usunąć pytania')
      return false
    }
  }

  // Dodawanie wszystkich pytań z pliku questions.ts
  const addAllQuestionsFromFile = async (category: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Filtrowanie pytań dla bieżącej kategorii
      const questionsToAdd = allQuestions.filter(q => q.category === category)
      
      // Sprawdzanie duplikatów
      const existingTitles = questions.map(q => q.title)
      const newQuestions = questionsToAdd.filter(q => !existingTitles.includes(q.title))
      
      if (newQuestions.length === 0) {
        setError('Wszystkie pytania z tej kategorii już istnieją w bazie danych')
        setLoading(false)
        return
      }
      
      // Dodawanie każdego pytania do Firebase
      const addedQuestions = []
      for (const question of newQuestions) {
        const questionToAdd = {
          title: question.title,
          points: question.points,
          tooltip: question.tooltip,
          category: question.category
        }
        
        const newId = await addQuestion(questionToAdd)
        addedQuestions.push({ ...question, id: newId })
      }
      
      // Aktualizacja stanu lokalnego
      setQuestions([...questions, ...addedQuestions])
      
      // Wyświetlanie komunikatu o sukcesie
      setError(`Dodano ${addedQuestions.length} nowych pytań do kategorii ${category}`)
    } catch (err) {
      console.error('Error adding all questions:', err)
      setError('Nie udało się dodać wszystkich pytań')
    } finally {
      setLoading(false)
    }
  }

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    addNewQuestion,
    updateExistingQuestion,
    deleteExistingQuestion,
    addAllQuestionsFromFile
  }
}