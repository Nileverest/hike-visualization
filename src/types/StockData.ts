export interface StackRange {
  lower_price: number;
  upper_price: number;
  total_volume: number;
  volume_percentage: number;
  average_volume: number;
  price_levels: number;
  volume_density: number;
}

export interface VolumeHistogram {
  [price: string]: number;
}

// Const objects for order and analysis types (using const assertions for erasableSyntaxOnly)
export const OrderIntent = {
  BUY_TO_OPEN: "BUY_TO_OPEN",
  SELL_TO_OPEN: "SELL_TO_OPEN",
  BUY_TO_CLOSE: "BUY_TO_CLOSE",
  SELL_TO_CLOSE: "SELL_TO_CLOSE"
} as const;

export const SymbolAnalysisConclusion = {
  ALL_TIME_HIGH_WITH_ACCEPTABLE_RISK: "ALL_TIME_HIGH_WITH_ACCEPTABLE_RISK",
  ALL_TIME_HIGH_WITH_UNACCEPTABLE_RISK: "ALL_TIME_HIGH_WITH_UNACCEPTABLE_RISK",
  CUR_PRICE_IN_HIGHEST_STACK_RANGE_WITH_ACCEPTABLE_RISK: "CUR_PRICE_IN_HIGHEST_STACK_RANGE_WITH_ACCEPTABLE_RISK",
  CUR_PRICE_IN_HIGHEST_STACK_RANGE_WITH_UNACCEPTABLE_RISK: "CUR_PRICE_IN_HIGHEST_STACK_RANGE_WITH_UNACCEPTABLE_RISK",
  CUR_PRICE_IN_LOWEST_STACK_RANGE_WITH_ACCEPTABLE_RISK: "CUR_PRICE_IN_LOWEST_STACK_RANGE_WITH_ACCEPTABLE_RISK",
  CUR_PRICE_IN_LOWEST_STACK_RANGE_WITH_UNACCEPTABLE_RISK: "CUR_PRICE_IN_LOWEST_STACK_RANGE_WITH_UNACCEPTABLE_RISK",
  CUR_PRICE_IN_STACK_RANGE_WITH_ACCEPTABLE_RISK: "CUR_PRICE_IN_STACK_RANGE_WITH_ACCEPTABLE_RISK",
  CUR_PRICE_IN_STACK_RANGE_WITH_UNACCEPTABLE_RISK: "CUR_PRICE_IN_STACK_RANGE_WITH_UNACCEPTABLE_RISK",
  NO_STATISTICS_COMPUTED: "NO_STATISTICS_COMPUTED",
  SHARPE_RATIO_NOT_IN_RANGE: "SHARPE_RATIO_NOT_IN_RANGE",
  NO_CLOSE_PAIR_RANGE_FOUND: "NO_CLOSE_PAIR_RANGE_FOUND",
  NO_APPLICABLE_ENTRY_SCENARIO_FOUND: "NO_APPLICABLE_ENTRY_SCENARIO_FOUND",
  NOT_ENOUGH_FOR_1_SHARE: "NOT_ENOUGH_FOR_1_SHARE",
  EXCEEDING_MAX_TOTAL_COST_EXPOSURE: "EXCEEDING_MAX_TOTAL_COST_EXPOSURE",
  GAIN_LOSS_RATIO_NOT_ACCEPTABLE: "GAIN_LOSS_RATIO_NOT_ACCEPTABLE"
} as const;

export type OrderIntent = typeof OrderIntent[keyof typeof OrderIntent];
export type SymbolAnalysisConclusion = typeof SymbolAnalysisConclusion[keyof typeof SymbolAnalysisConclusion];

// Entry decision interfaces
export interface AbstractEntryDecision {
  current_epoch: number;
  analysis_conclusion: SymbolAnalysisConclusion;
  intent: OrderIntent | null;
  quantity: number | null;
  price: number | null;
  gain_loss_ratio: number | null;
  expected_max_loss: number | null;
  expected_max_gain: number | null;
  expected_max_loss_percentage: number | null;
  expected_max_gain_percentage: number | null;
}

export interface VolumeProfileWMAStrategyEntryDecision extends AbstractEntryDecision {
  stop_loss: number | null;
  stop_win: number | null;
}

// New interfaces to match the Python backend structure
export interface BasePosition {
  // This would be defined based on the BasePosition class in Python
  // For now, we'll leave it as a generic object
  [key: string]: any;
}

export interface StrategyPositionOutput {
  symbol: string;
  positions_to_enter: BasePosition[];
  positions_to_update: BasePosition[];
}

export interface SymbolAnalysisOutput {
  symbol: string;
  current_epoch: number;
  current_price: number;
  stack_range_position: string;
  lower_stack_range: StackRange | null;
  upper_stack_range: StackRange | null;
  volume_histogram: VolumeHistogram;
  stack_ranges?: StackRange[];
  sharpe_ratio?: number;
}

// New structure that matches VolumeProfileWmaStockSelectionOutput
export interface VolumeProfileWmaStockSelectionOutput {
  strategy_position_output: StrategyPositionOutput;
  symbol_analysis_output: SymbolAnalysisOutput;
  long_entry_decisions?: VolumeProfileWMAStrategyEntryDecision[];
  short_entry_decisions?: VolumeProfileWMAStrategyEntryDecision[];
}

// Legacy interface for backward compatibility and component usage
export interface StockSymbol {
  symbol: string;
  current_price: number;
  stack_ranges: StackRange[];
  lower_stack_range?: StackRange;
  upper_stack_range?: StackRange;
  volume_histogram: VolumeHistogram;
  gain_loss_ratio?: number;
  sharpe_ratio?: number;
  conclusion: string;
}

// New configuration structure that matches StrategyDataProviderConfig
export interface StrategyDataProviderConfig {
  input_top_level_directory: string;
  start_datetime: string;
  end_datetime: string;
}

export interface VolumeHistogramStrategyConfig {
  interval: number;
  decay_factor: number;
  lower_range_volume_to_upper_range_ratio_lower: number;
  lower_range_volume_to_upper_range_ratio_upper: number;
  all_time_high_risk_percentage_threshold: number;
  resolution?: number;
  accumulated_resolution_to_price_ratio?: number;
}

export interface LogisticDecayVolumeHistogramStrategyConfig extends VolumeHistogramStrategyConfig {
  long_term_decay_factor: number;
  decay_rate: number;
  midpoint: number;
}

export interface SharpeRatioStrategyConfig {
  past_days: number;
  min_sharpe_ratio: number;
  max_sharpe_ratio: number;
  risk_free_rate: number;
  volatility_method: string;
}

export interface WeightedAverageCandleStickStrategyConfig {
  interval: number;
  interval_moving_average_window: number;
}

export interface PositionManagementConfig {
  max_cost_per_trade: number;
  max_total_cost_exposure: number;
}

export interface MajorStackRangeConfig {
  price_increment: number;
  tolerable_window: number;
  stack_range_min_ratio: number;
  volume_threshold_above_mean_ratio?: number;
  percentile?: number;
}

export interface BaseEntryFilteringConfig {
}

export interface GainLossRatioEntryFilteringConfig extends BaseEntryFilteringConfig {
  min_gain_loss_ratio: number;
  min_gain_percent: number;
  max_loss_percent: number;
  min_gain_amount: number;
  max_loss_amount: number;
}

export interface BaseDedupExistingPositionConfig {
  min_percentage_with_respect_to_existing_position_entry_price: number;
}

export interface VolumeProfileWMAStrategyConfig {
  is_test: boolean;
  strategy_data_provider_config: StrategyDataProviderConfig;
  volume_histogram_strategy_config: LogisticDecayVolumeHistogramStrategyConfig;
  sharpe_ratio_strategy_config: SharpeRatioStrategyConfig;
  candle_stick_strategy_config: WeightedAverageCandleStickStrategyConfig;
  position_management_config: PositionManagementConfig;
  major_stack_range_config: MajorStackRangeConfig;
  entry_filtering_config: GainLossRatioEntryFilteringConfig;
  dedup_existing_position_config: BaseDedupExistingPositionConfig;
}

// Legacy config interface for backward compatibility
export interface StockDataConfig {
  country: string;
  input_top_level_directory: string;
  output_directory: string;
  start_datetime: string;
  end_datetime: string;
  num_processes: number;
  sharpe_ratio_min: number;
  sharpe_ratio_max: number;
  gain_loss_ratio_threshold: number;
  lower_range_volume_to_upper_range_ratio_lower: number;
  lower_range_volume_to_upper_range_ratio_upper: number;
  price_increment: number;
  above_average_percentage?: number;
  tolerable_window: number;
  max_gap_percentage: number;
  volume_histogram_interval: number;
  decay_factor: number;
  candle_stick_interval: number;
  interval_moving_average_window: number;
  max_cost_per_trade: number;
  max_total_cost_exposure: number;
}

// New main data structure
export interface VolumeProfileVisualizationData {
  timestamp: string;
  config: VolumeProfileWMAStrategyConfig;
  results: VolumeProfileWmaStockSelectionOutput[];
}

// Legacy interface for backward compatibility
export interface StockData {
  timestamp: string;
  config: StockDataConfig;
  results: StockSymbol[];
} 