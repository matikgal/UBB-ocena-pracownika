import QuestionsComponent from '../questions/QuestionsComponent'

interface CategoryContentProps {
  selectedCategory: string;
  onPreviousCategory: () => void;
  onNextCategory: () => void;
  categories: string[];
}

export default function CategoryContent({
  selectedCategory,
  onPreviousCategory,
  onNextCategory,
  categories
}: CategoryContentProps) {
  return (
    <QuestionsComponent
      selectedCategory={selectedCategory}
      onPreviousCategory={onPreviousCategory}
      onNextCategory={onNextCategory}
      categories={categories}
    />
  )
}