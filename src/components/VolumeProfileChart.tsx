import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useMemo } from 'react';
import type { StockSymbol } from '../types/StockData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VolumeProfileChartProps {
  stockData: StockSymbol;
}

// Global variable for bar size configuration
const BAR_HEIGHT = 25; // Height per bar in pixels

const VolumeProfileChart: React.FC<VolumeProfileChartProps> = ({ stockData }) => {
  // Memoize the chart data calculation to ensure it updates when stockData changes
  const chartData = useMemo(() => {
    // Convert volume histogram to chart data
    const priceLabels = Object.keys(stockData.volume_histogram)
      .map(price => parseFloat(price))
      .sort((a, b) => b - a); // Sort descending for proper y-axis display (high to low)
    
    const volumes = priceLabels.map(price => stockData.volume_histogram[price.toString()]);
    const currentPrice = stockData.current_price;
    
    // Find the closest price level to current price for highlighting
    const closestPriceIndex = priceLabels.reduce((closestIndex, price, index) => {
      return Math.abs(price - currentPrice) < Math.abs(priceLabels[closestIndex] - currentPrice)
        ? index
        : closestIndex;
    }, 0);

    // Create background colors array with current price highlighted
    const backgroundColors = volumes.map((_, index) => {
      const price = priceLabels[index];
      
      if (index === closestPriceIndex) {
        return 'rgba(255, 20, 20, 0.9)'; // Bright red for current price
      }
      
      // Check if price is in any stack range
      const isInStackRange = stockData.stack_ranges.some(range => 
        price >= range.lower_price && price <= range.upper_price
      );
      
      // Check if price is in lower or upper stack range
      const isInLowerRange = stockData.lower_stack_range && 
        price >= stockData.lower_stack_range.lower_price && 
        price <= stockData.lower_stack_range.upper_price;
      
      const isInUpperRange = stockData.upper_stack_range && 
        price >= stockData.upper_stack_range.lower_price && 
        price <= stockData.upper_stack_range.upper_price;
      
      // Highlight lower stack range in red for all_time_high_with_acceptable_risk and cur_price_in_highest_stack_range_with_acceptable_risk
      if ((isInLowerRange && (stockData.conclusion === 'ALL_TIME_HIGH_WITH_ACCEPTABLE_RISK' || 
                             stockData.conclusion === 'CUR_PRICE_IN_HIGHEST_STACK_RANGE_WITH_ACCEPTABLE_RISK')) || 
          (isInLowerRange && stockData.conclusion === 'ENTRY_POINT_FOUND') || 
          (isInUpperRange && stockData.conclusion === 'ENTRY_POINT_FOUND')) {
        return 'rgba(255, 0, 0, 0.6)'; // Red for lower/upper stack ranges
      } else if (isInStackRange) {
        return 'rgba(54, 162, 235, 0.6)'; // Blue for other stack ranges
      } else {
        return 'rgba(201, 203, 207, 0.4)'; // Gray for other levels
      }
    });

    // Create border colors with thicker border for current price
    const borderColors = volumes.map((_, index) => {
      if (index === closestPriceIndex) {
        return 'rgba(255, 0, 0, 1)'; // Solid red border for current price
      }
      return backgroundColors[index].replace('0.4', '1').replace('0.6', '1').replace('0.9', '1');
    });

    // Create border width array with thicker border for current price
    const borderWidths = volumes.map((_, index) => {
      if (index === closestPriceIndex) {
        return 3; // Thicker border for current price
      }
      return 1;
    });

    return {
      labels: priceLabels.map(price => price.toFixed(2)),
      datasets: [
        {
          label: 'Volume',
          data: volumes,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: borderWidths,
        },
      ],
      borderWidths, // Include for options
      currentPrice, // Include for plugin
      priceLabels, // Include for plugin
    };
  }, [stockData]);

  // Plugin to draw current price line and label - recreated when stockData changes
  const currentPricePlugin = useMemo(() => ({
    id: 'currentPricePlugin',
    afterDraw: (chart: any) => {
      const { ctx, scales } = chart;
      const currentPrice = chartData.currentPrice;
      
      // Find the closest price bar index for the current price
      const closestPriceIndex = chartData.priceLabels.reduce((closestIndex, price, index) => {
        return Math.abs(price - currentPrice) < Math.abs(chartData.priceLabels[closestIndex] - currentPrice)
          ? index
          : closestIndex;
      }, 0);
      
      // Get the y-position using the bar index instead of price value
      const yPosition = scales.y.getPixelForValue(closestPriceIndex);
      
      if (yPosition) {
        // Draw horizontal line across the chart
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 3; // Made the line slightly thicker
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(scales.x.left, yPosition);
        ctx.lineTo(scales.x.right, yPosition);
        ctx.stroke();
        
        // Draw current price label with enhanced visibility
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(scales.x.right - 85, yPosition - 15, 80, 30);
        ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeRect(scales.x.right - 85, yPosition - 15, 80, 30);
        
        ctx.fillStyle = 'rgba(255, 0, 0, 1)';
        ctx.font = 'bold 14px Arial'; // Slightly larger font
        ctx.textAlign = 'center';
        ctx.fillText(`$${currentPrice.toFixed(2)}`, scales.x.right - 45, yPosition + 5);
        
        // Add "CURRENT" text below price
        ctx.font = 'bold 10px Arial';
        ctx.fillText('CURRENT', scales.x.right - 45, yPosition - 5);
        ctx.restore();
      }
    }
  }), [chartData.currentPrice, chartData.priceLabels]);

  const options = useMemo(() => ({
    indexAxis: 'y' as const, // This makes the bar chart horizontal
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000, // Add smooth animation when switching symbols
    },
    elements: {
      bar: {
        borderWidth: chartData.borderWidths,
      }
    },
    datasets: {
      bar: {
        categoryPercentage: 0.9, // Makes bars take up more space in their category
        barPercentage: 0.95, // Makes individual bars thicker
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${stockData.symbol} - Volume Profile (Current Price: $${chartData.currentPrice.toFixed(2)}) - ${stockData.conclusion}`,
        font: {
          size: 18,
        },
        color: 'rgba(0, 0, 0, 0.8)',
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const priceLevel = parseFloat(context.label);
            if (Math.abs(priceLevel - chartData.currentPrice) < 0.1) {
              return '🎯 CURRENT PRICE';
            }
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Volume',
          font: {
            size: 14,
          },
        },
        beginAtZero: true,
      },
      y: {
        title: {
          display: true,
          text: 'Price ($)',
          font: {
            size: 14,
          },
        },
        ticks: {
          maxTicksLimit: 60, // Show even more price levels
          font: {
            size: 12,
          },
        },
      },
    },
  }), [stockData.symbol, stockData.conclusion, chartData.currentPrice, chartData.borderWidths]);

  // Calculate dynamic height based on number of bars
  const numberOfBars = Object.keys(stockData.volume_histogram).length;
  const chartHeight = Math.max(400, numberOfBars * BAR_HEIGHT); // Minimum 400px, then scale with bars

  return (
    <div className="w-full" style={{ height: `${chartHeight}px` }}>
      <Bar 
        key={`${stockData.symbol}-${chartData.currentPrice}`} // Force re-render when symbol/price changes
        data={chartData} 
        options={options} 
        plugins={[currentPricePlugin]} 
      />
    </div>
  );
};

export default VolumeProfileChart; 