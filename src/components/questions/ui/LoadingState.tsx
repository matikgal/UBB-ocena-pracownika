export default function LoadingState() {
  return (
    <div className="p-6 flex justify-center items-center h-full">
      <div className="text-gray-500 flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
        <span>Ładowanie pytań...</span>
      </div>
    </div>
  )
}