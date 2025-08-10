
import type { StockSymbol } from '../types/StockData';
import { isStockEntryPoint } from '../utils/dataTransformer';

interface StockInfoProps {
  stockData: StockSymbol;
}

const StockInfo: React.FC<StockInfoProps> = ({ stockData }) => {
  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(1)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const getConclusionColor = (conclusion: string) => {
    if (isStockEntryPoint(conclusion)) {
      return 'text-green-600 dark:text-green-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {stockData.symbol}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Current Price: <span className="font-semibold text-red-500">${formatNumber(stockData.current_price)}</span>
        </p>
        <p className={`text-lg font-semibold ${getConclusionColor(stockData.conclusion)}`}>
          Conclusion: {stockData.conclusion}
        </p>
      </div>

      {isStockEntryPoint(stockData.conclusion) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Lower Stack Range */}
          {stockData.lower_stack_range && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Lower Stack Range
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Price Range:</span>
                  <span className="font-medium">${formatNumber(stockData.lower_stack_range.lower_price)} - ${formatNumber(stockData.lower_stack_range.upper_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Volume:</span>
                  <span className="font-medium">{formatVolume(stockData.lower_stack_range.total_volume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Volume %:</span>
                  <span className="font-medium">{(stockData.lower_stack_range.volume_percentage * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Price Levels:</span>
                  <span className="font-medium">{stockData.lower_stack_range.price_levels}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Volume Density:</span>
                  <span className="font-medium">{formatVolume(stockData.lower_stack_range.volume_density)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Upper Stack Range - Only show for entry point stocks */}
          {isStockEntryPoint(stockData.conclusion) && stockData.upper_stack_range && (
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-teal-800 dark:text-teal-200 mb-2">
                Upper Stack Range
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Price Range:</span>
                  <span className="font-medium">${formatNumber(stockData.upper_stack_range.lower_price)} - ${formatNumber(stockData.upper_stack_range.upper_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Volume:</span>
                  <span className="font-medium">{formatVolume(stockData.upper_stack_range.total_volume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Volume %:</span>
                  <span className="font-medium">{(stockData.upper_stack_range.volume_percentage * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Price Levels:</span>
                  <span className="font-medium">{stockData.upper_stack_range.price_levels}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Volume Density:</span>
                  <span className="font-medium">{formatVolume(stockData.upper_stack_range.volume_density)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stack Ranges */}
      {stockData.stack_ranges && stockData.stack_ranges.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            All Stack Ranges
          </h3>
          <div className="space-y-4">
            {stockData.stack_ranges.map((range, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Range {index + 1}:</span>
                  <span className="font-medium">${formatNumber(range.lower_price)} - ${formatNumber(range.upper_price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Volume:</span>
                  <span className="font-medium">{formatVolume(range.total_volume)} ({(range.volume_percentage * 100).toFixed(2)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {(stockData.sharpe_ratio || stockData.gain_loss_ratio) && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Performance Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {stockData.sharpe_ratio && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sharpe Ratio:</span>
                <span className="font-medium">{formatNumber(stockData.sharpe_ratio, 3)}</span>
              </div>
            )}
            {stockData.gain_loss_ratio && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Gain/Loss Ratio:</span>
                <span className="font-medium">{formatNumber(stockData.gain_loss_ratio, 3)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Legend</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Current Price Level</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span>Lower/Upper Stack Range</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Other Stack Ranges</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Other Price Levels</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInfo; 