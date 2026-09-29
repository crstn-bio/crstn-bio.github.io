---
title: Beyond p-tau217 — the incremental value of plasma Aβ42/40 for predicting amyloid-PET status
short: Plasma Aβ42/40 beyond p-tau217
period: Mar – Jul 2026
order: 2
role: Independent analysis — design, code and write-up
setting: Independent project
summary: Does adding plasma Aβ42/40 to a p-tau217 model improve prediction of amyloid-PET positivity? At fixed sensitivity, it raised specificity by about 9–10 percentage points — meaning fewer amyloid-negative people flagged as screen-positive.
methods:
  - Participant-grouped 5-fold cross-validation, repeated 5 times
  - Out-of-fold predictions evaluated within CU and CI strata
  - 95% CIs from participant-level cluster bootstrap (1,000 replicates)
  - Plasma and PET measurements matched one-to-one within participant by assessment date
tools:
  - R
  - Statistical modelling
status: complete
figure: amyloid-operating-points
---

## Question

Plasma p-tau217 is already a strong blood marker for brain amyloid. The practical question is whether measuring Aβ42/40 as well is worth it — does it change who gets sent on for confirmatory amyloid-PET?

## Approach

I matched each participant's plasma sample to their amyloid-PET scan one-to-one by actual assessment date, then compared a p-tau217 model with a p-tau217 + Aβ42/40 model. Every estimate comes from out-of-fold predictions under participant-grouped cross-validation, so no participant appears in both training and evaluation. Uncertainty comes from a participant-level cluster bootstrap.

## Result

The figure above fixes sensitivity at clinically relevant operating points and asks how specificity changes. Adding Aβ42/40 increased specificity at both: fewer amyloid-negative individuals would be classified as screen-positive.

## Limits

This is a descriptive operating-point analysis built on the same out-of-fold predictions used for the primary AUC analysis. It is not an independent external validation, and the numbers should be read that way.
