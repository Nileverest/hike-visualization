/**
 * Verification script to test that the app can load and display the JSON data correctly
 * This simulates what the app does when loading data
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Load the actual JSON file that the app will use
const sampleDataPath = join(process.cwd(), 'public/volume_profile_strategy_20250801_20250809.json');
const sampleData = JSON.parse(readFileSync(sampleDataPath, 'utf8'));

console.log('🔍 Data Loading Verification');
console.log('=' .repeat(50));

console.log(`📊 Loaded ${sampleData.results.length} stock symbols`);
console.log(`⏰ Timestamp: ${sampleData.timestamp}`);
console.log(`🏗️  Config loaded: ${sampleData.config ? '✅' : '❌'}`);

console.log('\n📈 Stock Symbols Summary:');
console.log('-'.repeat(30));

sampleData.results.forEach((result, index) => {
  const analysis = result.symbol_analysis_output;
  const position = result.strategy_position_output;
  
  console.log(`${index + 1}. ${analysis.symbol}`);
  console.log(`   Price: $${analysis.current_price.toFixed(2)}`);
  console.log(`   Position: ${analysis.stack_range_position.replace('StackRangePosition.', '')}`);
  console.log(`   Lower Stack Range: ${analysis.lower_stack_range ? '✅' : '❌'}`);
  console.log(`   Upper Stack Range: ${analysis.upper_stack_range ? '✅' : '❌'}`);
  console.log(`   Volume Histogram Points: ${Object.keys(analysis.volume_histogram).length}`);
  console.log(`   Sharpe Ratio: ${analysis.sharpe_ratio || 'N/A'}`);
  console.log(`   Positions to Enter: ${position.positions_to_enter.length}`);
  console.log(`   Positions to Update: ${position.positions_to_update.length}`);
  console.log('');
});

// Test data transformation (simplified version)
function deriveConclusion(position) {
  if (position.includes('HIGHER_THAN_ALL_STACK_RANGES')) {
    return 'ALL_TIME_HIGH_WITH_ACCEPTABLE_RISK';
  } else if (position.includes('IN_THE_ONLY_STACK_RANGE')) {
    return 'CUR_PRICE_IN_THE_ONLY_STACK_RANGE_WITH_ACCEPTABLE_RISK';
  }
  return 'NO_APPLICABLE_ENTRY_SCENARIO_FOUND';
}

console.log('🔄 Testing Data Transformation:');
console.log('-'.repeat(40));

const entryPointStocks = [];
sampleData.results.forEach(result => {
  const analysis = result.symbol_analysis_output;
  const conclusion = deriveConclusion(analysis.stack_range_position);
  const isEntryPoint = conclusion.includes('ACCEPTABLE_RISK');
  
  console.log(`${analysis.symbol}: ${conclusion} ${isEntryPoint ? '🚀' : ''}`);
  
  if (isEntryPoint) {
    entryPointStocks.push(analysis.symbol);
  }
});

console.log(`\n🎯 Entry Point Stocks: ${entryPointStocks.join(', ')}`);
console.log(`📊 Total Entry Points: ${entryPointStocks.length}/${sampleData.results.length}`);

console.log('\n✅ Data loading verification complete!');
console.log('The app should be able to display all this data correctly.');

// Test a few key data integrity checks
let allChecksPass = true;

// Check 1: All symbols have required fields
for (const result of sampleData.results) {
  const analysis = result.symbol_analysis_output;
  if (!analysis.symbol || !analysis.current_price || !analysis.stack_range_position || !analysis.volume_histogram) {
    console.log(`❌ Missing required fields for ${analysis.symbol}`);
    allChecksPass = false;
  }
}

// Check 2: Volume histograms have valid data
for (const result of sampleData.results) {
  const histogram = result.symbol_analysis_output.volume_histogram;
  const entries = Object.entries(histogram);
  if (entries.length === 0) {
    console.log(`❌ Empty volume histogram for ${result.symbol_analysis_output.symbol}`);
    allChecksPass = false;
  }
  
  // Check first entry for valid price/volume
  const [price, volume] = entries[0];
  if (isNaN(parseFloat(price)) || isNaN(volume)) {
    console.log(`❌ Invalid volume histogram data for ${result.symbol_analysis_output.symbol}`);
    allChecksPass = false;
  }
}

console.log(`\n${allChecksPass ? '✅' : '❌'} Data integrity: ${allChecksPass ? 'PASSED' : 'FAILED'}`);

if (allChecksPass) {
  console.log('\n🎉 All verification checks passed! The React app should work correctly with this data.');
} else {
  console.log('\n⚠️  Some verification checks failed. Please review the data format.');
}
