---
title: Memory
order: 6
published: true
status: question
group: Memory
question: What can neural activity reveal about one memory?
mechanism: experience → encoding → representation → consolidation → storage → retrieval → behaviour
diagram: memory-chain
sources:
  - label: Josselyn & Tonegawa, Science 2020 · memory engrams
    url: https://www.science.org/doi/10.1126/science.aaw4325
  - label: Zhao et al., Nature Neuroscience 2023 · the same cells tracked across adult life in mice
    url: https://liulab.seas.harvard.edu/publications/tracking-neural-activity-same-cells-during-entire-adult-life-mice
---

Memory is not one variable. A memory could fail at several of these stages, and each failure would look different in the signals. The chain is simplified: stages overlap, and retrieval can change a memory.

**Proposed next step.** Record the same neurons over long periods, track how single-cell activity drifts, and look for a structure *g* that stays the same while the memory does: y<sub>M</sub>(t<sub>1</sub>) ≠ y<sub>M</sub>(t<sub>2</sub>), but g(y<sub>M</sub>(t<sub>1</sub>)) ≈ g(y<sub>M</sub>(t<sub>2</sub>)). Only then ask whether that state predicts the effect of stimulation. Not yet conducted.

To ask *which* memory, the same neurons have to be followed from encoding to retrieval, over days to months. Rigid probes drift and scar the tissue; injectable mesh electronics have kept single units stable in mice for up to about 18 months, including in hippocampus (Zhao et al., 2023). Two limits matter here. "Same neuron" is inferred from a stable spike waveform, not from a label on the cell, and a stable neuron is not yet a known memory: that still needs the engram-style tests. In people, hippocampal recording is still clinical depth electrodes only.
