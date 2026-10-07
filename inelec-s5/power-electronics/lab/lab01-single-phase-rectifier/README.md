# Lab 01 — Single-phase half-wave / full-wave rectifier (experimental)

| File | What |
|---|---|
| `handout.pdf` | Original lab sheet |
| `report.tex` | Full report in LaTeX (theory, circuits, tables, waveforms, discussion, conclusion) |
| `report.pdf` | Compiled report |

**Before submitting:** open `report.tex`, edit the block at the top (`EDIT THIS BLOCK ONLY`):
put your names/date, replace the 8 values (`\HWRdc`, `\HWRac`, …) with your oscilloscope
readings (V_dc = "Mean" in DC coupling, V_ac = "RMS" in AC coupling), set `\measuredtrue`,
and recompile. V_rms, F.F., R.F., η and the error table update automatically.

Predicted values (V_m = 33.94 V, R = 500 Ω, C = 1000 µF):

| Case | V_dc | R.F. | η |
|---|---|---|---|
| Half-wave R | 10.80 V | 1.211 | 40.5 % |
| Half-wave R-C | 33.26 V | 0.012 | ≈100 % |
| Full-wave R | 21.61 V | 0.483 | 81.1 % |
| Full-wave R-C | 33.60 V | 0.006 | ≈100 % |
