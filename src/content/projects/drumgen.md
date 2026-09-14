---
title: drumgen
date: 2026-07-01
kind: sound
status: undead
summary: >-
  A deterministic drum generator that tries to sound alive. Rules and
  probability over curated pattern banks, not a model.
cause: Never crossed from experiment into product. The loops are good anyway.
---

A rules-and-probability engine over hand-written banks, on purpose: predictable,
debuggable, light, and steered by knobs a musician understands rather than a
seed and a prayer. Pick a genre, set chaos and syncopation, get MIDI to drag
into a DAW.

Each bank is a genre's grammar written out — instrument grids, groove templates,
fills, variations, and the poles a style moves between. Deathtech, afrobeat,
drum and bass, nu metal.

Timing and velocity humanisation are calibrated against
[Magenta's Groove MIDI Dataset](https://magenta.tensorflow.org/datasets/groove)
(CC BY 4.0): per-style means feed the groove templates, the residual σ feeds the
jitter. Statistics, not patterns.

An arranger on top builds sections out of one mother groove and orchestrates by
tiers, because the first version generated bars that never became a song.
