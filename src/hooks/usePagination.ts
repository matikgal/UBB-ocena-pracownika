import { useState, useEffect } from 'react'

export function usePagination<T>(items: T[], itemsPerPageDefault: number = 10) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(itemsPerPageDefault)
  
  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1)
  }, [items.length])
  
  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(items.length / itemsPerPage)
  
  return {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    currentItems,
    totalPages,
    totalItems: items.length
  }
}