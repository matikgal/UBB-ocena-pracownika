interface EmptyStateProps {
  category: string;
}

export default function EmptyState({ category }: EmptyStateProps) {
  return (
    <div className="p-6 text-gray-500 flex flex-col items-center justify-center h-64">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
      <p className="text-center">Brak pytań dla kategorii: <span className="font-medium">{category}</span></p>
    </div>
  )
}