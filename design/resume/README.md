# resume.pdf

`public/resume.pdf` is generated from `resume.html`, not from a Word document.
Edit the HTML, re-render, and the PDF is reproducible instead of being a binary
someone has to open Word to change.

```sh
node render.mjs      # needs playwright; writes ../../public/resume.pdf
```

It has to stay **one page** and it has to stay **one column** — most companies
run a CV through a parser before a person sees it, and a second column
interleaves the text. `pdftotext public/resume.pdf -` shows what the parser
sees.

Body is Inter; dates, stack lines and section labels are JetBrains Mono, the
same face the site is set in.
