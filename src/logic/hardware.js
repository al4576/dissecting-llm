// H100 specs: NVIDIA H100 Tensor Core GPU Datasheet (March 2023)
export const H100_SPECS = {
  name: "NVIDIA H100 SXM5",
  transistors: 80e9,
  cudaCores: 14592,
  tensorCores: 456,
  flops_fp16: 3958e12,       // TFLOPS
  tdp_watts: 700,
  price_usd: 30000,
  memory_gb: 80,
  memory_bandwidth_tbps: 3.35,
  /** Silicon die: ~814 mm² for GH100 (NVIDIA Hopper). Used with CSS `mm` for an on-screen scale hint. */
  die_width_mm: 28.5,
  die_height_mm: 28.5,
  die_area_mm2: 814,
  /** Full SKU uses ~132 SMs; one SM “footprint” as sqrt(area/count) — teaching order-of-magnitude only. */
  sm_region_side_mm: 2.5,
};

// GPT-3 training cost: Patterson et al. 2021, "Carbon and the Cloud"
// Data center water: Li et al. 2023, "Making AI Less Thirsty"
export const TRAINING_RUN = {
  model: "GPT-3",
  gpu_hours: 355000,          // V100 GPU-hours from the paper
  estimated_kwh: 1287000,     // from Patterson et al. 2021
  co2_tonnes: 552,            // ibid
  water_liters_estimate: 700000, // estimate from Li et al. 2023
};

export const DATACENTER = {
  example: "Google Dalles, Oregon",
  pue: 1.10,                  // Power Usage Effectiveness
  mw_capacity: 100,           // megawatts
  annual_kwh: 876e6,
  cooling_method: "Evaporative cooling towers",
  water_gal_per_day: 450000,
};
