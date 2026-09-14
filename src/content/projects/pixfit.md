---
title: PixFit
date: 2024-07-01
dateLabel: 2024 —
kind: code
featured: true
status: alive
summary: >-
  One finished ad in, every format the brand needs out. A generative engine when
  there's nothing to go on; a deterministic, editable one when the brand is set up.
stack: SST v3 · tRPC · SQS · Fargate · Aurora · Gemini · fal.ai · Bedrock — @ Winclap
---

A campaign gets made once and then has to exist in eighteen shapes. Someone
resizes it by hand, every time, for every brand.

PixFit does it twice over, because the two halves of the problem are not the
same problem.

**Without a setup**, it takes a flat image and redraws the whole piece in the
new shape. Not a crop and not a stretch — a regeneration, which is what lets it
extend a background and move things around without tearing. That is also its
limit: a redraw can drift on text and logos, so the product says so before you
press the button, and the fixes are regenerate, auto-correct, or paint over a
region.

**With a setup**, there is no generative model in the path at all. The brand's
templates and rules are compiled once, and a deterministic engine applies them
to each new master. Out comes a PNG and an editable SVG with named layers that
a designer opens in Illustrator. Margins, minimum sizes and palette are checked
per piece, and they hold because they are the input, not the output.

Twenty-four tRPC Lambdas behind a CloudFront router, ten SQS queues with dead
letter queues behind them, and a Fargate worker that scales from zero when the
queue gets deep. Every model call is logged to S3 and queryable in Athena, so
cost per piece is a number and not a guess.
