import { useState } from 'react'

export function useTooltipManager(initialTooltips: string[] = ['']) {
  const [tooltips, setTooltips] = useState<string[]>(initialTooltips)

  const addTooltip = () => {
    setTooltips([...tooltips, ''])
  }

  const removeTooltip = (index: number) => {
    const newTooltips = [...tooltips]
    newTooltips.splice(index, 1)
    setTooltips(newTooltips)
  }

  const updateTooltip = (index: number, value: string) => {
    const newTooltips = [...tooltips]
    newTooltips[index] = value
    setTooltips(newTooltips)
  }

  return {
    tooltips,
    setTooltips,
    addTooltip,
    removeTooltip,
    updateTooltip
  }
}