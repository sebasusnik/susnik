---
title: CRT synth
date: 2026-08-01
kind: art
status: alive
summary: >-
  An ESP32 generating black-and-white composite video for a CRT. Eight
  generative scenes that react to a microphone and a capacitive antenna, and
  rotate on their own.
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
