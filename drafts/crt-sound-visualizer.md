---
# A base to rewrite in my own words, not something to publish as it is.
# Once it is mine, this file replaces src/content/projects/crt-sound-visualizer.md as it is,
# and the row gets its own page again. These comments can stay.
# Nothing in drafts/ is built.
title: CRT sound visualizer
date: 2026-08-01
kind: hardware
status: alive
soon: true
summary: >-
  A music visualizer in the spirit of Windows Media Player's, on an ESP32. A
  microphone listens; the picture goes out as composite video to an old TV. A
  hand near the antenna bends it.
---

The ESP32 has no video hardware. It makes the composite signal itself, timing
the sync pulses in software and pushing a framebuffer out a pin, which is most
of why the project exists.

Every scene was written first as a browser simulator with its own framebuffer
and no canvas primitives, so the maths would port to the microcontroller
unchanged. The simulator is still the source of truth for the look.

Sound comes in through a microphone; a capacitive antenna picks up a hand
moving near the set. A tunnel, an oscilloscope, Lissajous figures, a vector
field, a blob, an orb.
