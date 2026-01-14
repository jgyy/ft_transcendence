export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Loading</h1>
          <p className="text-gray-400">Please wait while we load your content...</p>
        </div>

        {/* Animated dots */}
        <div className="flex gap-2 mt-4">
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '0s' }}
          />
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          />
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          />
        </div>
      </div>
    </div>
  );
}
