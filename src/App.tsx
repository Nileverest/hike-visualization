import { useState, useEffect } from 'react';
import './App.css';
import StockInfo from './components/StockInfo';
import VolumeProfileChart from './components/VolumeProfileChart';
import DataEndpointTester from './components/DataEndpointTester';
import type { StockData, StockSymbol } from './types/StockData';
import { ENTRY_CONCLUSION_SET } from './types/Constants';
import { ENVIRONMENT_CONFIG } from './config/environment';

// Use environment-aware data endpoint
const DATA_ENDPOINT = ENVIRONMENT_CONFIG.getDefaultDataEndpoint();

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StockData | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockSymbol | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  useEffect(() => {
    console.log('App component mounted');
    
    const loadData = async () => {
      try {
        console.log('Attempting to fetch data from:', DATA_ENDPOINT);
        // parse the url structure to get the date path:
        // Example http://localhost:5173/strategy/2025/06/20/volume_profile_strategy.json
        // will be 2025/06/20/volume_profile_strategy.json
        // from current url
        const datePath = window.location.pathname.split('/').slice(2).join('/'); // get the date path
        console.log('Date path:', datePath);
        const url = ENVIRONMENT_CONFIG.getDataEndpoint(datePath);
        console.log('URL:', url);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          // Handle CORS
          // mode: 'cors',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData: StockData = await response.json();
        console.log('Data loaded successfully:', jsonData);
        setData(jsonData);
        
        // Set the first stock as selected by default
        if (jsonData.results && jsonData.results.length > 0) {
          setSelectedStock(jsonData.results[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Sort stocks to put ENTRY_CONCLUSION_SET stocks first
  const sortedResults = data?.results ? [...data.results].sort((a, b) => {
    const aIsEntry = ENTRY_CONCLUSION_SET.includes(a.conclusion);
    const bIsEntry = ENTRY_CONCLUSION_SET.includes(b.conclusion);
    if (aIsEntry && !bIsEntry) return -1;
    if (!aIsEntry && bIsEntry) return 1;
    return 0;
  }) : [];
  
  const currentItems = sortedResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = data ? Math.ceil(data.results.length / itemsPerPage) : 0;

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  console.log('Rendering App - loading:', loading, 'error:', error, 'data:', !!data);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loading...</h1>
          <p className="text-gray-600 dark:text-gray-400">Fetching stock data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
          <p className="text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.results || data.results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Data</h1>
          <p className="text-gray-600 dark:text-gray-400">No stock data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Stock Volume Profile Visualization
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Data loaded: {data.timestamp} | Found {data.results.length} stock symbols
          </p>
        </header>

        {/* Data Endpoint Tester */}
        <DataEndpointTester />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stock Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Stock Symbols
                </h2>
                <div className="flex items-center space-x-2">
                  <label htmlFor="itemsPerPage" className="text-sm text-gray-600 dark:text-gray-400">
                    Show:
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value={5}>5</option>
                    <option value={25}>25</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {currentItems.map((stock, index) => {
                  const isHighlighted = ENTRY_CONCLUSION_SET.includes(stock.conclusion);
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedStock(stock)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedStock?.symbol === stock.symbol
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : isHighlighted
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:border-green-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className={`font-semibold ${isHighlighted ? 'text-green-700 dark:text-green-300' : ''}`}>
                        {stock.symbol} {isHighlighted ? '🚀' : ''}
                      </div>
                      <div className={`text-sm opacity-75 ${isHighlighted ? 'text-green-700 dark:text-green-300' : ''}`}>
                        ${stock.current_price.toFixed(2)}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {getPageNumbers().map((number) => (
                    <button
                      key={number}
                      onClick={() => handlePageChange(number)}
                      className={`px-3 py-1 rounded ${
                        currentPage === number
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedStock ? (
              <div className="space-y-6">
                {/* Stock Information */}
                <StockInfo stockData={selectedStock} />
                
                {/* Volume Profile Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <VolumeProfileChart stockData={selectedStock} />
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Select a Stock Symbol
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a stock from the sidebar to view its volume profile and detailed information.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 