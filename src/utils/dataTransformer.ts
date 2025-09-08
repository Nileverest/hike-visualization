import type { 
  VolumeProfileVisualizationData, 
  VolumeProfileWmaStockSelectionOutput, 
  StockData, 
  StockSymbol,
  SymbolAnalysisOutput,
  VolumeProfileWMAStrategyEntryDecision
} from '../types/StockData';
import { SymbolAnalysisConclusion } from '../types/StockData';
import { ENTRY_STACK_RANGE_POSITIONS } from '../types/Constants';

/**
 * Determines if a stock analysis result represents an entry point
 * Based on the stack range position and presence of stack ranges
 */
export function isEntryPoint(symbolAnalysis: SymbolAnalysisOutput): boolean {
  // Check if the stack range position indicates a potential entry point
  const hasEntryPosition = ENTRY_STACK_RANGE_POSITIONS.includes(symbolAnalysis.stack_range_position as any);
  
  // Additional logic can be added here to check for other factors like:
  // - Sharpe ratio within acceptable range
  // - Risk assessment
  // - Volume criteria
  
  const hasStackRanges = (
    symbolAnalysis.lower_stack_range !== null || 
    symbolAnalysis.upper_stack_range !== null ||
    (symbolAnalysis.stack_ranges && symbolAnalysis.stack_ranges.length > 0)
  );
  
  return Boolean(hasEntryPosition && hasStackRanges);
}

/**
 * Gets the gain_loss_ratio from entry decisions, preferring long decisions
 */
function getGainLossRatioFromEntryDecisions(
  longEntryDecisions?: VolumeProfileWMAStrategyEntryDecision[],
  shortEntryDecisions?: VolumeProfileWMAStrategyEntryDecision[]
): number | undefined {
  // First try to get from long entry decisions
  if (longEntryDecisions && longEntryDecisions.length > 0) {
    const decision = longEntryDecisions.find(d => d.gain_loss_ratio !== null);
    if (decision && decision.gain_loss_ratio !== null) {
      return decision.gain_loss_ratio;
    }
  }
  
  // Fallback to short entry decisions
  if (shortEntryDecisions && shortEntryDecisions.length > 0) {
    const decision = shortEntryDecisions.find(d => d.gain_loss_ratio !== null);
    if (decision && decision.gain_loss_ratio !== null) {
      return decision.gain_loss_ratio;
    }
  }
  
  return undefined;
}

/**
 * Gets the conclusion from entry decisions, preferring the most relevant one
 */
function getConclusionFromEntryDecisions(
  longEntryDecisions?: VolumeProfileWMAStrategyEntryDecision[],
  shortEntryDecisions?: VolumeProfileWMAStrategyEntryDecision[]
): SymbolAnalysisConclusion | undefined {
  // First try to get from long entry decisions
  if (longEntryDecisions && longEntryDecisions.length > 0) {
    return longEntryDecisions[0].analysis_conclusion;
  }
  
  // Fallback to short entry decisions
  if (shortEntryDecisions && shortEntryDecisions.length > 0) {
    return shortEntryDecisions[0].analysis_conclusion;
  }
  
  return undefined;
}

/**
 * Transforms a VolumeProfileWmaStockSelectionOutput into the legacy StockSymbol format
 */
export function transformVolumeProfileWmaStockSelectionOutput(result: VolumeProfileWmaStockSelectionOutput): StockSymbol {
  const analysis = result.symbol_analysis_output;
  
  // Extract data from entry decisions if available
  const gainLossRatio = getGainLossRatioFromEntryDecisions(
    result.long_entry_decisions,
    result.short_entry_decisions
  );
  
  const entryDecisionConclusion = getConclusionFromEntryDecisions(
    result.long_entry_decisions,
    result.short_entry_decisions
  );
  
  // Use entry decision conclusion if available, otherwise derive from analysis
  let conclusion: string;
  if (entryDecisionConclusion) {
    conclusion = entryDecisionConclusion;
  } else {
    conclusion = SymbolAnalysisConclusion.NO_APPLICABLE_ENTRY_SCENARIO_FOUND as string;
  }
  
  return {
    symbol: analysis.symbol,
    current_price: analysis.current_price,
    stack_ranges: analysis.stack_ranges || [],
    lower_stack_range: analysis.lower_stack_range || undefined,
    upper_stack_range: analysis.upper_stack_range || undefined,
    volume_histogram: analysis.volume_histogram,
    gain_loss_ratio: gainLossRatio,
    sharpe_ratio: analysis.sharpe_ratio,
    conclusion: conclusion
  };
}

/**
 * Transforms the new VolumeProfileVisualizationData format into the legacy StockData format
 * This allows existing components to work with the new data structure
 */
export function transformToLegacyFormat(newData: VolumeProfileVisualizationData): StockData {
  const transformedResults = newData.results.map(transformVolumeProfileWmaStockSelectionOutput);
  
  // Transform the config to match the legacy format
  const legacyConfig = {
    country: "US", // Default value since it's not in the new config
    input_top_level_directory: newData.config.strategy_data_provider_config.input_top_level_directory,
    output_directory: "", // Not available in new format
    start_datetime: newData.config.strategy_data_provider_config.start_datetime,
    end_datetime: newData.config.strategy_data_provider_config.end_datetime,
    num_processes: 1, // Default value
    sharpe_ratio_min: newData.config.sharpe_ratio_strategy_config.min_sharpe_ratio,
    sharpe_ratio_max: newData.config.sharpe_ratio_strategy_config.max_sharpe_ratio,
    gain_loss_ratio_threshold: newData.config.entry_filtering_config.min_gain_loss_ratio,
    lower_range_volume_to_upper_range_ratio_lower: newData.config.volume_histogram_strategy_config.lower_range_volume_to_upper_range_ratio_lower,
    lower_range_volume_to_upper_range_ratio_upper: newData.config.volume_histogram_strategy_config.lower_range_volume_to_upper_range_ratio_upper,
    price_increment: newData.config.major_stack_range_config.price_increment,
    above_average_percentage: newData.config.major_stack_range_config.volume_threshold_above_mean_ratio,
    tolerable_window: newData.config.major_stack_range_config.tolerable_window,
    max_gap_percentage: newData.config.major_stack_range_config.stack_range_min_ratio,
    volume_histogram_interval: newData.config.volume_histogram_strategy_config.interval,
    decay_factor: newData.config.volume_histogram_strategy_config.decay_factor,
    candle_stick_interval: newData.config.candle_stick_strategy_config.interval,
    interval_moving_average_window: newData.config.candle_stick_strategy_config.interval_moving_average_window,
    max_cost_per_trade: newData.config.position_management_config.max_cost_per_trade,
    max_total_cost_exposure: newData.config.position_management_config.max_total_cost_exposure
  };
  
  return {
    timestamp: newData.timestamp,
    config: legacyConfig,
    results: transformedResults
  };
}

/**
 * Detects whether the provided data is in the new format or legacy format
 */
export function isNewFormat(data: any): data is VolumeProfileVisualizationData {
  return (
    data &&
    data.results &&
    data.results.length > 0 &&
    data.results[0].strategy_position_output !== undefined &&
    data.results[0].symbol_analysis_output !== undefined
  );
}

/**
 * Automatically transforms data to legacy format if it's in the new format
 */
export function ensureLegacyFormat(data: any): StockData {
  if (isNewFormat(data)) {
    return transformToLegacyFormat(data);
  }
  return data as StockData;
}

/**
 * Determines if a stock symbol represents an entry point based on its conclusion
 * Works with both legacy and new conclusion formats
 */
export function isStockEntryPoint(conclusion: string): boolean {
  // Check for legacy format conclusions
  // if (conclusion.includes('WITH_ACCEPTABLE_RISK')) {
  //   return true;
  // }
  const processedConclusion = conclusion.split('.')[1];
  
  // Check for specific entry point conclusions using the const object values
  const entryConclusions: string[] = [
    // SymbolAnalysisConclusion.ALL_TIME_HIGH_WITH_ACCEPTABLE_RISK,
    SymbolAnalysisConclusion.CUR_PRICE_IN_HIGHEST_STACK_RANGE_WITH_ACCEPTABLE_RISK.toString(),
    SymbolAnalysisConclusion.CUR_PRICE_IN_LOWEST_STACK_RANGE_WITH_ACCEPTABLE_RISK.toString(),
    SymbolAnalysisConclusion.CUR_PRICE_IN_STACK_RANGE_WITH_ACCEPTABLE_RISK.toString(),
    // SymbolAnalysisConclusion.CUR_PRICE_IN_BETWEEN_STACK_RANGES_WITH_ACCEPTABLE_RISK
  ];
  
  return entryConclusions.includes(processedConclusion);
}
