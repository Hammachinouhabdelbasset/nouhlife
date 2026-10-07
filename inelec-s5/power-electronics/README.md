# Power Electronics

| | |
|---|---|
| Credits / Coeff | 6 / 3 (heaviest module) + Lab 2 credits |
| Weekly | Lecture 3 h (Mon 13:00, Wed 08:00) · TD 1.5 h (Wed 09:40) · Lab (Wed 11:20, A003) |
| Teachers | Lecture N. SABEUR · TD O. MERABET · Lab S. BOUTORA |
| Assessment | 40% continuous + 60% exam · Lab 100% continuous |
| Prerequisites | Calculus, Electrical Engineering I & II |

## Folders

- [`lectures/`](lectures/)
- [`td/`](td/)
- [`lab/`](lab/)
- [`summaries/`](summaries/)
- [`exams/`](exams/)

## Syllabus checklist

- [ ] Power devices, RMS values and harmonics
- [ ] Power diodes with RC / RL / LC / RLC loads, freewheeling diode
- [ ] Uncontrolled rectifiers: single-phase half / full wave, three-phase bridge, DC filter design
- [ ] Controlled (SCR) rectifiers, RLE load, inversion mode
- [ ] AC voltage controllers: on-off, phase control, PWM
- [ ] DC-DC converters: step-down (buck) and step-up (boost) choppers
- [ ] Inverters: single / three phase, voltage control, resonant & multilevel intro
- [ ] Protection: switching losses, heat sink, snubbers, MOV, EMI
- [ ] Case study

## TD tracker

| Series | Topic | Statement | Solution | Done |
|---|---|---|---|---|
| [01](td/series01/) | | | | ⬜ |
| 02 | | | | ⬜ |
| 03 | | | | ⬜ |

## Lab tracker

| Lab | Topic | Status |
|---|---|---|
| [01](lab/lab01-single-phase-rectifier/) | Single-phase half / full wave rectifier, R and R-C load (experimental) | ✅ report done — fill in measured values |
| 02 | Half-wave rectifier with RL load + freewheeling diode | ⬜ |
| 03 | Controlled rectification (SCR) | ⬜ |
| 04 | AC voltage control (back-to-back SCRs / TRIAC) | ⬜ |
| 05 | Step-down chopper | ⬜ |
| 06 | Single-phase inverter | ⬜ |

## How to study it

- Every week turn the TD sheet into a one-page formula summary per converter (V_avg, V_rms, I_avg, I_rms, ripple, form factor, PIV) → `summaries/`.
- Redo the lab circuits in PSpice / LTspice at home.
- Exam: start **2 weeks before** — full pass rectifiers → controlled rectifiers → AC controllers → choppers → inverters, then timed past papers.

## Resources

- M. H. Rashid, *Power Electronics: Circuits, Devices and Applications*
- Mohan, Undeland, Robbins, *Power Electronics*
- PSpice / LTspice for simulation
