import { Dataset } from "../types/flow";

export const datasets: Dataset[] = [
  {
    id: "isotropic",
    name: "Isotropic Turbulence",
    flowType: "Homogeneous isotropic turbulence",
    resolution: "1024^3 grid",
    spatialResolution: "1024 x 1024 x 1024",
    timeResolution: "1,024 saved time steps",
    variables: ["velocity", "pressure", "vorticity", "gradient"],
    timeRange: "t = 0 to 10.24",
    queryTypes: ["point", "line", "slice", "volume", "time-series"],
    supportedQueryLabels: ["Point", "Line", "2D slice", "3D volume", "Time series"],
    tags: ["High Resolution", "Time Resolved", "Pressure Available"],
    bestUseCase: "Benchmarking turbulence statistics and small-scale structure analysis.",
    difficulty: "Medium",
    summary: "Canonical turbulent flow dataset for testing analysis methods across all directions."
  },
  {
    id: "channel",
    name: "Channel Flow",
    flowType: "Wall-bounded turbulent channel",
    resolution: "2048 x 512 x 1536",
    spatialResolution: "2048 x 512 x 1536",
    timeResolution: "400 saved time steps",
    variables: ["velocity", "pressure", "wall shear", "vorticity"],
    timeRange: "t = 0 to 26",
    queryTypes: ["point", "line", "slice", "volume", "time-series"],
    supportedQueryLabels: ["Point", "Line", "2D slice", "3D volume", "Time series"],
    tags: ["Wall Bounded", "Pressure Available", "Time Resolved"],
    bestUseCase: "Studying near-wall structures, coherent streaks, and shear stress behavior.",
    difficulty: "High",
    summary: "Detailed wall turbulence reference with strong gradients near the channel walls."
  },
  {
    id: "boundary-layer",
    name: "Boundary Layer",
    flowType: "Spatially developing boundary layer",
    resolution: "4096 x 384 x 1024",
    spatialResolution: "4096 x 384 x 1024",
    timeResolution: "256 saved time steps",
    variables: ["velocity", "pressure", "temperature"],
    timeRange: "t = 0 to 18",
    queryTypes: ["point", "line", "slice", "volume"],
    supportedQueryLabels: ["Point", "Line", "2D slice", "3D volume"],
    tags: ["High Resolution", "Thermal Field", "Developing Flow"],
    bestUseCase: "Comparing streamwise growth, transition zones, and wall-normal profiles.",
    difficulty: "High",
    summary: "Research-grade dataset for boundary layer growth and spatial development studies."
  },
  {
    id: "mixing-layer",
    name: "Mixing Layer",
    flowType: "Free shear turbulent mixing layer",
    resolution: "1536 x 768 x 768",
    spatialResolution: "1536 x 768 x 768",
    timeResolution: "640 saved time steps",
    variables: ["velocity", "pressure", "scalar concentration"],
    timeRange: "t = 0 to 14.5",
    queryTypes: ["point", "slice", "volume", "time-series"],
    supportedQueryLabels: ["Point", "2D slice", "3D volume", "Time series"],
    tags: ["Scalar Field", "Time Resolved", "Pressure Available"],
    bestUseCase: "Investigating shear-layer roll-up, entrainment, and scalar mixing.",
    difficulty: "Medium",
    summary: "A compact but expressive dataset for free-shear turbulence and mixing studies."
  }
];
