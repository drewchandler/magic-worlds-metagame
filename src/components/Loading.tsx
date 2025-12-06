function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="text-center text-white">
        <div className="inline-block w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-5"></div>
        <p className="text-xl">Loading data...</p>
      </div>
    </div>
  )
}

export default Loading
