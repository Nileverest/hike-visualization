import { useState } from 'react';

interface DataEndpointTesterProps {
  onDataLoad?: (data: any) => void;
}

export default function DataEndpointTester({ onDataLoad }: DataEndpointTesterProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [testPath, setTestPath] = useState('/2025/03/20/volume_profile_strategy.json');

  const testEndpoint = async (path: string) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log(`Testing endpoint: ${path}`);
      const response = await fetch(path);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponse(data);
      onDataLoad?.(data);
      console.log('Data loaded successfully:', data);
    } catch (err) {
      console.error('Error testing endpoint:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = () => {
    testEndpoint(testPath);
  };

  const quickTestPaths = [
    '/2025/03/20/volume_profile_strategy.json',
    '/2025/06/07/volume_profile_strategy.json',
    '/2025/01/15/volume_profile_strategy.json'
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Data Endpoint Tester
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Test the proxy functionality by accessing different date paths. 
        These requests will be automatically redirected to the remote data endpoint.
      </p>

      <div className="space-y-4">
        {/* Quick test buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Test Paths:
          </label>
          <div className="flex flex-wrap gap-2">
            {quickTestPaths.map((path, index) => (
              <button
                key={index}
                onClick={() => {
                  setTestPath(path);
                  testEndpoint(path);
                }}
                disabled={loading}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {path.split('/').slice(-2).join('/')}
              </button>
            ))}
          </div>
        </div>

        {/* Custom path input */}
        <div>
          <label htmlFor="testPath" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Custom Path:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="testPath"
              value={testPath}
              onChange={(e) => setTestPath(e.target.value)}
              placeholder="/2025/03/20/volume_profile_strategy.json"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={handleTest}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Test'}
            </button>
          </div>
        </div>

        {/* Status display */}
        {loading && (
          <div className="text-blue-600 dark:text-blue-400">
            <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
            Testing endpoint...
          </div>
        )}

        {error && (
          <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {response && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
            <div className="text-green-700 dark:text-green-300 mb-2">
              <strong>✅ Success!</strong> Data loaded successfully.
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer text-green-600 dark:text-green-400">
                View response details
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(response, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
} 