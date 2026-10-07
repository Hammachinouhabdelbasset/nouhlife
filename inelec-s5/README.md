# Inelec S5 — Licence 3, Electrical & Electronics Engineering (2026/2027)

IGEE · UMBB Boumerdès · Semester 5 · Group L3-G03

Shared course folder: lectures, TD solutions, lab reports, summaries and past exams for every
semester-5 module, organised the same way so anyone can find things fast.

## Modules

| Module | Credits / Coeff | Lecture | TD | Lab | Assessment | Folder |
|---|---|---|---|---|---|---|
| Power Electronics | 6 / 3 | N. SABEUR | O. MERABET | S. BOUTORA (2 cr) | 40% CC + 60% exam · Lab 100% CC | [power-electronics](power-electronics/) |
| Linear Systems | 6 / 3 | A. DAAMOUCHE | O. HACHOUR | — | 40% CC + 60% exam | [linear-systems](linear-systems/) |
| EMF (Electromagnetic Field Theory) | 5 / 3 | F. GUICHI | M. CHALLAL | — | 40% CC + 60% exam | [emf](emf/) |
| Computer Architecture | 4 / 3 | A. KHOUAS | — | — | 40% CC + 60% exam | [computer-architecture](computer-architecture/) |
| Control (Process Control & Instrumentation) | 4 / 2 | M. AKROUM | — | Control Lab (2 cr) | 40% CC + 60% exam · Lab 100% CC | [control](control/) |
| PCB Design & Technologies | 1 / 1 | F. GUICHI | — | — | 100% CC (quizzes 50% + project 50%) | [pcb](pcb/) |

## Timetable (version of 01/10/2026)

| Day | Time | Session | Room |
|---|---|---|---|
| Sat | 13:00–14:30 | Control Lab | A111 (to confirm) |
| Sun | 08:00–09:30 | Computer Architecture — lecture | Amphi 3 |
| Sun | 09:40–11:10 | Linear Systems — lecture | Amphi 3 |
| Sun | 13:00–14:30 | Control — lecture | Amphi 3 |
| Sun | 14:40–16:10 | PCB — lecture | Amphi 3 |
| Mon | 08:00–09:30 | EMF — lecture | Amphi 3 |
| Mon | 09:40–11:10 | EMF — TD | B305 |
| Mon | 11:20–12:50 | Linear Systems — TD | B003 |
| Mon | 13:00–14:30 | Power Electronics — lecture | Amphi 3 |
| Tue | 08:00–09:30 | Linear Systems — lecture | Amphi 3 |
| Tue | 09:40–11:10 | Computer Architecture — lecture | Amphi 3 |
| Tue | 14:40–16:10 | Control — lecture | Amphi 3 |
| Wed | 08:00–09:30 | Power Electronics — lecture | Amphi 3 |
| Wed | 09:40–11:10 | Power Electronics — TD | B205 (to confirm) |
| Wed | 11:20–12:50 | Power Electronics Lab | A003 |
| Wed | 13:00–14:30 | EMF — lecture | Amphi 1 |

Thursday and Friday: no classes. **5 absences in one module = exclusion** (each lab counts as its own module).

## Folder layout (same in every module)

```
<module>/
├── README.md        overview, syllabus checklist, trackers, how to study it
├── lectures/        slides, handouts, your own notes (chNN-<topic>.pdf / .md)
├── td/              only if the module has TD — one folder per series
│   └── series01/    statement.pdf + solution.tex/.pdf
├── lab/             only if the module has a lab — one folder per lab
│   └── lab01-<topic>/  handout.pdf + report.tex + report.pdf
├── summaries/       formula sheets, one-page summaries
└── exams/           past midterms / finals (+ solutions)
```

Templates to start from: [`_templates/`](_templates/) — LaTeX lab report and TD solution.

## Naming rules

- lowercase, words separated by `-`, numbers with two digits: `lab02-full-wave-rectifier`, `series03`, `ch04-z-transform.pdf`.
- Keep the original handout as `handout.pdf` / `statement.pdf` next to the solution.
- Always commit the `.tex` **and** the compiled `.pdf` (friends without LaTeX can read the PDF).
- Don't commit LaTeX junk (`.aux`, `.log`, `.toc`, `.out`, `.synctex.gz`) — the `.gitignore` here handles it.

## How to contribute (friends)

1. Get access to the repo (ask Nouh) or send him the files.
2. Put your file in the right module/folder following the layout above.
3. Tick the item in that module's README tracker.
4. LaTeX: upload the `.tex` to [Overleaf](https://www.overleaf.com) (New project → Upload), compile, download the PDF.

## Progress dashboard

| Module | Lectures | TD series | Labs | Summary | Past exams |
|---|---|---|---|---|---|
| Power Electronics | 0 | 0 | 1 ✅ (Lab 01) | — | — |
| Linear Systems | 0 | 0 | n/a | — | — |
| EMF | 0 | 0 | n/a | — | — |
| Computer Architecture | 0 | n/a | n/a | — | — |
| Control | 0 | n/a | 0 | — | — |
| PCB | 0 | n/a | n/a (project) | — | — |
