# Redesign notes

How the site is organized and why. Kept short on purpose.

## A. Audit (what was there)

- Astro 7, static, GitHub Pages. Dark, mono + Geist, SVG/canvas diagrams, no animation libraries.
- Strong pieces kept: hero point-cloud brain, HCP anatomy viewer (M1 · STN · hippocampus), project pipelines, robot/chip hardware drawings, ADNI report page.
- Conflicts removed: device-first framing ("the future device"), memory as a footnote, Arduino read as neuroscience, one very long homepage.

## B. Information architecture

Homepage (short, one argument):

1. Hero: point-cloud brain, "Modelling the individual brain."
2. 01 Question: one model, two questions (state · information) converging into one loop.
3. 02 Why: two clinical frontiers (Parkinson's nearer-term control, Alzheimer's long-term memory) + three targets on a real HCP brain.
4. 03 How: model-first system diagram + program map (11 stages in 5 groups). Each stage opens its own page.
5. 04 Evidence: done work only, with method dialogs; build path (Build 01 → Build 02 → Summer 2027).
6. 05 Next questions: five testable questions, each linked to a stage.
7. 06 Collaborate.

Stage pages `/how/<slug>/`: question · mechanism · one note · one figure · sources · previous / next.

| Group | Stages | Logic |
|---|---|---|
| Build the model | 01 Measure · 02 Decode · 03 Personalize | observe → infer |
| Control | 04 Predict · 05 Control (Parkinson's) | predict → act |
| Memory | 06 Memory · 07 Retrieval fails | represent → retrieve |
| Interface | 08 Minimize · 09 Interface | information → hardware |
| Frontier | 10 Scale · 11 Restore (Alzheimer's) | scale → restore |

## C. Storyboard (each figure says one thing)

- Measure: pulses → delayed response → this brain vs population dose curve.
- Decode: traces → feature matrix → point moving between states A/B.
- Personalize: population cloud → one person's points arrive → posterior shrinks.
- Predict: z(t) branches under u₁ u₂ u₃; one is chosen; observed path returns; model updates.
- Control: pretrain → personalize → device → stimulate when β is high (concept) + Parkinson's testbed card.
- Memory: experience → … → behaviour, with "?" at stages that could fail.
- Retrieval fails (climax): failure → observations → model → absent / degraded / inaccessible → perturbations → predicted change → retrieval?
- Minimize: many channels collapse to the minimum sufficient signal.
- Interface: discovery → model keeps few sites → implant? yes / maybe not → same model; then robot + chip as translational concept.
- Scale: signals → populations → circuits → networks → one individual model.
- Restore: seven-step ladder; restore only last; Alzheimer's frontier card.

## D. Content map

| Item | Stage | Status |
|---|---|---|
| a-tbTUS + FES thesis | 01 Measure | Current work |
| Deep-brain microelectrode recordings (workshop) | 02 Decode | Completed |
| EEG / EMG spectral analysis | 02 Decode | Completed |
| ADNI plasma Aβ42/40 + p-tau217 → amyloid PET | Human data · disease modelling | Completed (not memory decoding) |
| IMU pan–tilt | Control-system engineering | Independent build (not a BCI) |
| Neural control (LFP → policy → simulated stimulation) | Build 02 | Next experiment |
| Human signals → patient model → closed-loop modelling | Summer 2027 | Next experiment |

## E. Files

- Content (edit these): `src/content/site.yaml`, `src/content/roadmap/*.md`, `public/images/`. See `EDIT-ME.md`.
- Loader: `src/lib/content.ts`. Components only render what it returns.
- Roadmap pages: `src/pages/how/[slug].astro`, built from the roadmap collection (`src/content.config.ts`).

## G. Scientific QA

| Claim | Label |
|---|---|
| Parkinson's 11.9M (2021) → 25.2M (2050), BMJ 2025 / GBD 2021 | Fact from source |
| 57M with dementia (2021), Alzheimer's 60–70%, WHO | Fact from source |
| FDA approved adaptive DBS in 2025 | Fact from source |
| Subcortical β-burst dynamics reconstructed from cortical recordings, Yin et al. 2026 | Fact from source |
| Engram activation restored recall in early-AD mouse models, Roy et al. 2016 | Fact from source |
| Neuropixels 1.0 NHP Long: 45 mm, 384 of 4,416 sites | Fact from source |
| ADNI ΔAUC +0.017 (0.902 → 0.919) | Fact from source (own report) |
| "Most DBS runs at fixed settings, tuned by hand" | Interpretation |
| "Current drugs ease symptoms or modestly slow early decline; none restores lost memory" | Interpretation |
| Memory restoration as a harder form of closed-loop control | Interpretation (hedged with "may") |
| Absent / degraded / inaccessible; all next questions | Future question |
| Robot, chip, adaptive-DBS pipeline, interface branch | Concept (labelled, "not built") |
| Parkinson's projection line | Two sourced points joined by a straight line; no invented shape |
| "Same stimulation, different responses" plot | Labelled schematic |
