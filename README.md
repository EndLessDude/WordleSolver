# Wordle Solver

This wordle solver will solve wordle's better than any other wordle solver.

## Features

- **Green letters**: five boxes, one per position, for letters you know are in the correct spot. Typing a letter auto-advances to the next box, and Backspace on an empty box moves back.
- **Yellow letters**: add as many yellow letters as you need. For each one, choose the positions it cannot be in. Positions already locked in by a green letter are automatically crossed out and disabled.
- **Gray letters**: type letters that are not in the word (e.g. `Q, W, X, Z`). Commas and spaces are both fine.
- **Live results**: the word count (e.g. `23 possible words`) and the matching words update on every change. Removing or editing any constraint recalculates immediately.
- **Help icon**: a `?` icon in the top right explains green, yellow and gray letters. It expands on hover or keyboard focus, and toggles on tap for touch devices.
- **Calm design**: a minimal deep teal and warm cream color scheme with roomy, evenly spaced inputs.

## Project Structure

```
.
├── index.html    # Page structure and the yellow-row template
├── script.js     # Word loading, constraint reading, and filtering logic
├── style.css     # Styling and color scheme
├── words.json    # List of ~2,300 possible Wordle answers
└── README.md
```


## Word List Format

`words.json` should be a plain JSON array of lowercase 5-letter words:

```json
[
  "aback",
  "abase",
  "abate"
]
```

On load, the app lowercases every entry, removes duplicates, and discards anything that is not exactly 5 letters. It never adds words of its own.

## How Filtering Works

A word appears in the results only if it passes every constraint:

| Section | Rule |
| --- | --- |
| Green | The word has the entered letter at that exact position. Empty boxes impose no restriction. |
| Yellow | The word contains the letter, and the letter is not in any position marked as unavailable. |
| Gray | The word contains none of the gray letters. |

All input is case-insensitive.

### Repeated letters

If a letter is entered as gray but is also entered as green or yellow (which happens in Wordle when a guess contains a letter twice and only one copy is in the answer), the green or yellow rule takes precedence. The letter is not blanket-excluded, because that would contradict the other constraint. If you would rather have gray always win in that conflict, edit the gray check in `wordMatches()` in `script.js`.

## Use this link to try the my project:

https://betterwordlesolver.netlify.app/
