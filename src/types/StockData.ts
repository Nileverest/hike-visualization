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
export interface StockSelectionResult {
  strategy_position_output: StrategyPositionOutput;
  symbol_analysis_output: SymbolAnalysisOutput;
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

// New configuration structure that matches VolumeProfileWMAStrategyConfig
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
}

export interface SharpeRatioStrategyConfig {
  past_days: number;
  min_sharpe_ratio: number;
  max_sharpe_ratio: number;
  risk_free_rate: number;
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
  volume_threshold_above_mean_ratio: number;
  tolerable_window: number;
  stack_range_min_ratio: number;
}

export interface VolumeProfileWMAStrategyConfig {
  is_test: boolean;
  strategy_data_provider_config: StrategyDataProviderConfig;
  volume_histogram_strategy_config: VolumeHistogramStrategyConfig;
  sharpe_ratio_strategy_config: SharpeRatioStrategyConfig;
  candle_stick_strategy_config: WeightedAverageCandleStickStrategyConfig;
  position_management_config: PositionManagementConfig;
  major_stack_range_config: MajorStackRangeConfig;
  gain_loss_ratio_threshold: number;
  dedup_threshold_percentage_with_respect_to_existing_position: number;
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
  results: StockSelectionResult[];
}

// Legacy interface for backward compatibility
export interface StockData {
  timestamp: string;
  config: StockDataConfig;
  results: StockSymbol[];
} 