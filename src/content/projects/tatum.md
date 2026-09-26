---
title: Tatum
date: 2026-09-01
dateLabel: ∞
kind: sound
status: alive
summary: >-
  A synth engine in Rust that plays songs written as text. Edit the file and it
  changes on the next bar; plug in a MIDI controller and the knobs move it live.
track:
  src: tatum-detroit
  title: Belle Isle After Midnight
---

It was called synth-core, and it was on this list as undead: it had grown
faster than I could hold it, and I had stopped. It came back smaller, stricter
and with a name. A tatum is the shortest pulse you can hear in a rhythm, the
grid everything else lands on.

A song is a `.synth` file. Four instruments modelled on the Volcas — an acid
bass, a four-operator FM, poly keys, a drum machine — a sixteen-step sequencer
with swing, slides, ties and parameter locks, effects, scenes and an
arrangement. The compiler is strict on purpose: a typo is an error on its line,
not a silent default.

The engine is `no_std` with zero dependencies. The same core renders to WAV
from a CLI, plays through the sound card, and runs in the browser as WASM.

**Live.** `tatum watch` re-reads the file on every save. A changed value applies
at once; anything bigger takes over on the next bar, keeping every tail and
voice the edit did not touch. A save that does not compile is reported while
the last good version keeps playing.

**Hands.** A `midi` block maps a controller onto the song: knobs and faders to
any parameter, the keys to a track's instrument, the pads to single drums. The
last hand wins — a save never snaps a knob back.

**Claude.** An MCP server gives Claude the compiler, so it writes songs with
the errors in the loop instead of guessing at the syntax.

The track above is one `.synth` file, rendered: Detroit techno, 130 BPM,
F minor, ninety-six bars. No samples; every sound is synthesised.
