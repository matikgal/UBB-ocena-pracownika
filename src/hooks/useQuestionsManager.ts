import { useState, useEffect } from 'react'
import {
  fetchQuestionsByCategory,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from '../services/firebase/questionsService'
import { allQuestions } from '../lib/questions'

interface Question {
  id: string
  title: string
  points: number | string
  tooltip: string[]
}

export function useQuestionsManager(initialCategory: string) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch questions when component mounts or category changes
  useEffect(() => {
    fetchQuestions(initialCategory)
  }, [initialCategory])

  // Fetch questions for a specific category
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

  // Add a new question
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
      
      // Update local state
      setQuestions([...questions, { ...question, id: newId }])
      return newId
    } catch (err) {
      console.error('Error adding question:', err)
      setError('Nie udało się dodać pytania')
      return null
    }
  }

  // Update an existing question
  const updateExistingQuestion = async (question: Question) => {
    try {
      const questionToUpdate = {
        title: question.title,
        points: question.points,
        tooltip: question.tooltip
      }

      await updateQuestion(question.id, questionToUpdate)
      
      // Update local state
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

  // Delete a question
  const deleteExistingQuestion = async (id: string) => {
    try {
      await deleteQuestion(id)
      // Update local state
      setQuestions(questions.filter(q => q.id !== id))
      return true
    } catch (err) {
      console.error('Error deleting question:', err)
      setError('Nie udało się usunąć pytania')
      return false
    }
  }

  // Add all questions from the questions.ts file
  const addAllQuestionsFromFile = async (category: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Filter questions for the current category
      const questionsToAdd = allQuestions.filter(q => q.category === category)
      
      // Check for duplicates
      const existingTitles = questions.map(q => q.title)
      const newQuestions = questionsToAdd.filter(q => !existingTitles.includes(q.title))
      
      if (newQuestions.length === 0) {
        setError('Wszystkie pytania z tej kategorii już istnieją w bazie danych')
        setLoading(false)
        return
      }
      
      // Add each question to Firebase
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
      
      // Update local state
      setQuestions([...questions, ...addedQuestions])
      
      // Show success message
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