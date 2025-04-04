interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return <div className="p-6 text-red-500 bg-red-50 rounded-md border border-red-100 m-4">{message}</div>
}