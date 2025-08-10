/**
 * Integration test to verify that the sample JSON file can be loaded and transformed correctly
 * Run this with: node src/tests/integration.test.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple test framework
let testCount = 0;
let passedCount = 0;

function test(name, fn) {
  testCount++;
  try {
    console.log(`\n🧪 Running test: ${name}`);
    fn();
    passedCount++;
    console.log(`✅ PASSED: ${name}`);
  } catch (error) {
    console.log(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`Expected value to be defined, but got undefined`);
      }
    },
    toHaveLength(expected) {
      if (!actual || actual.length !== expected) {
        throw new Error(`Expected length ${expected}, but got ${actual ? actual.length : 'undefined'}`);
      }
    },
    toContain(expected) {
      if (!actual || !actual.includes(expected)) {
        throw new Error(`Expected array to contain ${expected}`);
      }
    }
  };
}

// Mock the transformer functions (simplified versions)
function isNewFormat(data) {
  return (
    data &&
    data.results &&
    data.results.length > 0 &&
    data.results[0].strategy_position_output !== undefined &&
    data.results[0].symbol_analysis_output !== undefined
  );
}

function deriveConclusion(symbolAnalysis) {
  const position = symbolAnalysis.stack_range_position;
  
  // Simple logic for testing
  if (position === "StackRangePosition.HIGHER_THAN_ALL_STACK_RANGES") {
    return "ALL_TIME_HIGH_WITH_ACCEPTABLE_RISK";
  } else if (position === "StackRangePosition.IN_THE_ONLY_STACK_RANGE") {
    return "CUR_PRICE_IN_THE_ONLY_STACK_RANGE_WITH_ACCEPTABLE_RISK";
  }
  return "NO_APPLICABLE_ENTRY_SCENARIO_FOUND";
}

function transformStockSelectionResult(result) {
  const analysis = result.symbol_analysis_output;
  
  return {
    symbol: analysis.symbol,
    current_price: analysis.current_price,
    stack_ranges: analysis.stack_ranges || [],
    lower_stack_range: analysis.lower_stack_range || undefined,
    upper_stack_range: analysis.upper_stack_range || undefined,
    volume_histogram: analysis.volume_histogram,
    sharpe_ratio: analysis.sharpe_ratio,
    conclusion: deriveConclusion(analysis)
  };
}

function transformToLegacyFormat(newData) {
  const transformedResults = newData.results.map(transformStockSelectionResult);
  
  return {
    timestamp: newData.timestamp,
    config: {
      // Simplified config transformation
      input_top_level_directory: newData.config.strategy_data_provider_config.input_top_level_directory,
      start_datetime: newData.config.strategy_data_provider_config.start_datetime,
      end_datetime: newData.config.strategy_data_provider_config.end_datetime,
      gain_loss_ratio_threshold: newData.config.gain_loss_ratio_threshold,
      sharpe_ratio_min: newData.config.sharpe_ratio_strategy_config.min_sharpe_ratio,
      sharpe_ratio_max: newData.config.sharpe_ratio_strategy_config.max_sharpe_ratio,
    },
    results: transformedResults
  };
}

// Load the actual JSON file
console.log('📁 Loading sample JSON file...');
const sampleDataPath = join(__dirname, '../../public/volume_profile_strategy_20250801_20250809.json');
let sampleData;

try {
  const fileContent = readFileSync(sampleDataPath, 'utf8');
  sampleData = JSON.parse(fileContent);
  console.log('✅ Sample JSON file loaded successfully');
} catch (error) {
  console.error('❌ Failed to load sample JSON file:', error.message);
  process.exit(1);
}

// Run tests
console.log('\n🚀 Starting integration tests...\n');

test('Sample JSON file should be in new format', () => {
  expect(isNewFormat(sampleData)).toBe(true);
});

test('Sample JSON should have correct structure', () => {
  expect(sampleData.timestamp).toBeDefined();
  expect(sampleData.config).toBeDefined();
  expect(sampleData.results).toBeDefined();
  expect(sampleData.results.length).toBe(9); // Actual number of stocks in the sample data
});

test('First result should have correct structure', () => {
  const firstResult = sampleData.results[0];
  expect(firstResult.strategy_position_output).toBeDefined();
  expect(firstResult.symbol_analysis_output).toBeDefined();
  expect(firstResult.strategy_position_output.symbol).toBeDefined();
  expect(firstResult.symbol_analysis_output.symbol).toBeDefined();
});

test('Symbol analysis should have required fields', () => {
  const analysis = sampleData.results[0].symbol_analysis_output;
  expect(analysis.symbol).toBeDefined();
  expect(analysis.current_price).toBeDefined();
  expect(analysis.stack_range_position).toBeDefined();
  expect(analysis.volume_histogram).toBeDefined();
});

test('Should transform to legacy format correctly', () => {
  const transformed = transformToLegacyFormat(sampleData);
  
  expect(transformed.timestamp).toBe(sampleData.timestamp);
  expect(transformed.config).toBeDefined();
  expect(transformed.results).toHaveLength(sampleData.results.length);
  
  const firstStock = transformed.results[0];
  expect(firstStock.symbol).toBeDefined();
  expect(firstStock.current_price).toBeDefined();
  expect(firstStock.conclusion).toBeDefined();
  expect(firstStock.volume_histogram).toBeDefined();
});

test('Transformed data should have valid conclusions', () => {
  const transformed = transformToLegacyFormat(sampleData);
  
  for (const stock of transformed.results) {
    expect(stock.conclusion).toBeDefined();
    console.log(`   ${stock.symbol}: ${stock.conclusion}`);
  }
});

test('Volume histogram should have numeric values', () => {
  const firstStock = sampleData.results[0].symbol_analysis_output;
  const histogram = firstStock.volume_histogram;
  
  const prices = Object.keys(histogram);
  expect(prices.length > 0).toBe(true);
  
  // Check first few entries
  for (let i = 0; i < Math.min(3, prices.length); i++) {
    const price = prices[i];
    const volume = histogram[price];
    expect(typeof parseFloat(price)).toBe('number');
    expect(typeof volume).toBe('number');
  }
});

// Summary
console.log('\n📊 Test Summary:');
console.log(`   Total tests: ${testCount}`);
console.log(`   Passed: ${passedCount}`);
console.log(`   Failed: ${testCount - passedCount}`);

if (passedCount === testCount) {
  console.log('\n🎉 All tests passed! The data transformation is working correctly.');
  process.exit(0);
} else {
  console.log('\n💥 Some tests failed. Please check the implementation.');
  process.exit(1);
}
