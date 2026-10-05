import { Dataset } from "../types/flow";

export const datasets: Dataset[] = [
  {
    id: "isotropic",
    name: "Isotropic Turbulence",
    flowType: "Isotropic turbulence, Emulsions (We = 0.5)",
    resolution: "128^3 cell grid; staggered face grids",
    spatialResolution: "128 x 128 x 128 cells",
    timeResolution: "1,054 stored frames; nonuniform time intervals",
    variables: ["p", "phi_1", "u_face", "v_face", "w_face"],
    timeRange: "time array: 0 to 359.508755; units unknown",
    queryTypes: ["point", "slice", "volume", "time-series"],
    supportedQueryLabels: ["Point", "2D slice", "3D volume", "Time series"],
    tags: ["HDF5", "Time Resolved", "Staggered Grid"],
    bestUseCase: "Inspecting verified raw fields for the We = 0.5 Emulsions variant.",
    difficulty: "Medium",
    summary: "One verified Emulsions file is queryable through the remote source; other configurations remain unmapped."
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
