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

export interface StockData {
  timestamp: string;
  config: StockDataConfig;
  results: StockSymbol[];
} 