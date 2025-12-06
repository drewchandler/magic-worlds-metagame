interface ErrorProps {
  message: string
  onRetry: () => void
}

function Error({ message, onRetry }: ErrorProps) {
  return (
    <div className="flex justify-center items-center min-h-[400px] p-5">
      <div className="bg-red-50 border-2 border-red-200 text-red-800 p-8 rounded-xl max-w-2xl text-center">
        <h2 className="text-2xl font-bold mb-4">⚠️ Error Loading Data</h2>
        <p className="mb-6 leading-relaxed">{message}</p>
        <button
          onClick={onRetry}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 active:scale-95 transition-all"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

export default Error
