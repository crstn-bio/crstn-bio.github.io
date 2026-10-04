# How to edit this site

You only ever edit these three places:

| What | Where |
|---|---|
| Homepage text (hero, question + loop, two systems, brain viewer, method, projects, questions, contact) | `src/content/site.yaml` |
| Roadmap pages (one file = one node) | `src/content/roadmap/*.md` |
| Images and diagrams | `public/images/` |

Save, push, and the site rebuilds. To preview on your computer first: `npm install` once, then `npm run dev` and open http://localhost:4321.

---

## Homepage: `src/content/site.yaml`

Find the section (`hero:`, `question:`, `why:`, `anatomy:`, `approach:`, `projects:`, `questions:`, `contact:`) and change the text.

- **Hero title and line:** `hero:` → `title:` and `line:`
- **The big question:** `question:` → `title:`
- **The loop (the main diagram, under the question):** `question:` → `loop:`
  - `steps:` one block per circle, clockwise from the top: `name`, `field` (the small symbol), `text`. Add or remove a block and the circles re-space themselves.
  - `next:` (optional, inside a step) an honest "next step" row with a `label` and a `url`, for a step you haven't done yet.
  - `center:` the three lines in the middle. `closing:` and `formula:` the line under the loop.
- **A project:** copy one block under `projects:` and edit it. `piece:` decides which loop step it sits under (the step's `id`: `measure`, `estimate`, `predict`, `perturb`).
- **Two systems:** `why:` → `cards:` (one per system) and `bridge:` (the line under the cards).
- **Brain viewer:** `anatomy:` → `title:`, `questions:` (the four short questions) and `targets:` (one per tab).
- **Method:** `approach:` → `principles:` (the three cards; `page:` is the roadmap file name it opens, e.g. `personalize`) and `method_label:` (row of roadmap buttons; leave empty to hide). The row lists your published roadmap pages automatically. `hero:` → `button_method:` is the second button on the first screen.
- **Research questions:** `questions:` → `list:` (one question per line, starting with `- `)

Three rules for YAML:
1. Keep the spaces at the start of each line exactly as they are.
2. If your text contains a colon `:`, wrap the whole text in "double quotes".
3. In text you can use `*italic*`, `**bold**` and `[link text](https://…)`.

---

## Roadmap pages: `src/content/roadmap/`

Each file is one node and one page. The file name is the web address: `measure.md` → `/how/measure/`.

The top of the file, between the `---` lines, holds the settings. Everything below it is normal Markdown, shown next to the question on the page.

```markdown
---
title: Measure                 # name in the roadmap
order: 1                       # position; numbers 01, 02… are added automatically
published: true                # false = hidden everywhere
status: current                # current | done | build | next | question | concept | frontier
group: Build the model         # shown in the path at the top of the page
question: How does the human brain respond to intervention?
mechanism: intervene → measure → relate
diagram: measure               # see "Diagrams" below
sources:
  - label: Author et al., Journal 2026
    url: https://…
---

Write the page here in Markdown.

![Caption for the figure](/images/my-figure.png)
```

- **Change text:** edit the file.
- **Reorder:** change `order:`. Decimals work, so `order: 7.5` goes between 7 and 8.
- **Rename a node:** change `title:`.
- **Change status:** change `status:`. Optionally add `status_label: My own words` to change the badge text.
- **Hide or show:** `published: false` or `published: true`.
- **Add a page:** copy any `.md` file, rename it (the name becomes the address), and edit it.
- **Remove a page:** delete the file, or set `published: false`.
- **Add an image:** put it in `public/images/` and write `![description](/images/name.png)` in the text.
- **Sources:** add or remove lines under `sources:` (each one needs `label:` and `url:`).
- **Evidence buttons:** under `evidence:`, give a `label:` and the `project:` id from `site.yaml`.

Optional extras (see `control.md` and `restore.md` for examples):
- `diagram_caption:` a small line under the diagram
- `card:` a boxed note with a `label`, `status`, `title`, `text`, `rows` and `note`
- `steps:` a staircase list of `name` + `text` (the card then sits beside it)

---

## Diagrams

`diagram:` on a roadmap page can be:

- **A built-in animated diagram:** `measure`, `decode`, `personalize`, `predict-control`, `adaptive-dbs`, `memory-chain`, `retrieval-failure`, `minimize`, `interface-branch`, `implant-hardware`, `scale`
- **Your own file:** `diagram: /images/diagrams/my-diagram.svg`
- **Several, top to bottom:** `diagram: [interface-branch, /images/diagrams/extra.svg]`
- **Nothing:** leave the line out

To replace a diagram, save your SVG in `public/images/diagrams/` and point `diagram:` to it. After that, you update the diagram by overwriting that SVG file with the same name.

The homepage's main diagram is the loop (`question:` → `loop:`, see above). To add your own picture under the question instead, set `question:` → `diagram_image: /images/diagrams/my-diagram.svg`; delete the `loop:` block if you want only the picture.

Projects work the same way: `diagram:` is `tus`, `spikes`, `eeg`, `adni` or `imu`, or an `/images/…` file.

---

## If the site doesn't build

The error message names the file and the line. It's almost always one of these:
- a missing space at the start of a line
- a `:` inside text that isn't in quotes
- a `status:` that isn't one of the seven allowed words
