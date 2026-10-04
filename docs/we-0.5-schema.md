# We = 0.5 Emulsions: inspected HDF5 schema

Inspected file: `We_0_5.hdf5` (35,002,509,662 bytes, about 32.6 GiB). The local path is intentionally not recorded in the repository. Inspection used `h5py` object metadata, the complete 1,054-element `step` and `time` arrays, and only a 2 x 2 x 2 sample at time index 0 from each field. The full field arrays were never loaded.

## Hierarchy

There are **no HDF5 groups**. All seven datasets are at the root.

| Path | Shape | Dimensions | Dtype | Attributes | Storage |
| --- | --- | ---: | --- | --- | --- |
| `/p` | (1054, 128, 128, 128) | 4 | float32 | `grid_location=cell` | gzip level 4, shuffled, chunks (1,64,64,64) |
| `/phi_1` | (1054, 128, 128, 128) | 4 | float32 | `grid_location=cell` | gzip level 4, shuffled, chunks (1,64,64,64) |
| `/u_face` | (1054, 129, 128, 128) | 4 | float32 | `grid_location=x-face` | gzip level 4, shuffled, chunks (1,64,64,64) |
| `/v_face` | (1054, 128, 129, 128) | 4 | float32 | `grid_location=y-face` | gzip level 4, shuffled, chunks (1,64,64,64) |
| `/w_face` | (1054, 128, 128, 129) | 4 | float32 | `grid_location=z-face` | gzip level 4, shuffled, chunks (1,64,64,64) |
| `/step` | (1054,) | 1 | int64 | none | contiguous, uncompressed |
| `/time` | (1054,) | 1 | float64 | none | contiguous, uncompressed |

All five fields have a fill value of zero, fixed maximum shape equal to their current shape, and no Fletcher32 checksum. `/step` and `/time` have no HDF5 dimension scales or labels. The 4D datasets likewise have no dimension scales or labels.

File attributes: `dimensions="time followed by native spatial dimensions"`, `format="ExaFlow3D fields assembled with FPCSLpy"`, `merged_from=["first_258.hdf5", "second_796.hdf5"]`, and `precision="float32"`.

## Axes and relationships

The first dimension is time according to the file attribute. `step` and `time` each have 1,054 values, matching the first dimension of every field. The remaining axes are **inferred** to be x, y, z in that order: `u_face` has one extra element in axis 1, `v_face` in axis 2, and `w_face` in axis 3, consistent with their `grid_location` attributes. The file does not explicitly label those dimensions. Cell grids are 128 x 128 x 128; face grids are staggered as shown above. These fields should not be combined as a collocated vector without an explicit interpolation method.

`step` starts at 16,000 and ends at 279,250, increasing by 250 each stored frame. `time` starts at 0 and ends at 359.508755317947. It is strictly increasing but not uniformly spaced (observed adjacent differences approximately 0.206746 to 0.385). Querying therefore uses **array indices**, not an assumed physical time interval. The API returns the matching `step` and `time` values for a slice.

There are no coordinate arrays, physical units, domain lengths, spatial spacing, Reynolds number, density ratio, or additional Weber metadata in the HDF5 attributes. The Weber value 0.5 comes from the selected variant/file path, not an internal HDF5 attribute. Field names are exposed verbatim; scientific meanings beyond their names and `grid_location` attributes remain unverified.

Representative values at frame index 0 and spatial index (0,0,0) were: `/p` 1.009291172, `/phi_1` 0.0, `/u_face` 0.404914439, `/v_face` 0.927092612, and `/w_face` -0.430962741. These are raw stored values, not interpreted physical units.

## Frontend comparison

| Current prototype assumption | Real file |
| --- | --- |
| Isotropic catalog: 1024 x 1024 x 1024, 1,024 steps, t=0..10.24 | This variant: cell grid 128³, face grids 129 x 128 x 128 etc., 1,054 frames, time 0..359.508755 |
| Generic `velocity`, `pressure`, `vorticity`, `gradient` choices | Actual field IDs: `p`, `phi_1`, `u_face`, `v_face`, `w_face` |
| Float coordinates over a presumed 256-wide preview domain | Integer array indices; physical coordinates are absent |
| Uniform time-step or interval input | 1,054 frame indices paired with nonuniform `/time` values |
| 8 bytes per value estimator | Each field is float32: 4 bytes per value, before JSON overhead or compression |
| Generic JSON containing physical coordinates and time | Verified query API uses variant and allowlisted variable IDs plus half-open index ranges |

Other dataset variants and the general comparison catalog remain prototype data. No structure for them has been inferred from this one file.
