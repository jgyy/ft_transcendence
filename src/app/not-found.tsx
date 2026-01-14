import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 flex items-center justify-center">
      <Card className="text-center max-w-md">
        <div className="text-6xl mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-gray-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold block"
          >
            Back to Home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold block"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Fun 404 message */}
        <p className="text-gray-500 text-sm mt-8">
          Looks like you took a wrong turn. Let's get you back on track!
        </p>
      </Card>
    </div>
  );
}
