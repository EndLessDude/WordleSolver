// ---------------------------------------------
// Wordle Solver - script.js
// ---------------------------------------------

let WORD_LIST = [];

// Load the word list from words.json
fetch('words.json')
  .then(response => response.json())
  .then(data => {
    // Normalize, dedupe, and keep only valid 5-letter words
    const seen = new Set();
    WORD_LIST = data
      .map(w => String(w).toLowerCase().trim())
      .filter(w => {
        if (w.length !== 5) return false;
        if (seen.has(w)) return false;
        seen.add(w);
        return true;
      });
    runFilter();
  })
  .catch(err => {
    console.error('Failed to load words.json', err);
    document.getElementById('results-count').textContent = 'Error loading word list';
  });

// ---------------------------------------------
// DOM references
// ---------------------------------------------
const greenInputs = document.querySelectorAll('.green-input');
const yellowEntriesContainer = document.getElementById('yellow-entries');
const addYellowBtn = document.getElementById('add-yellow-btn');
const yellowRowTemplate = document.getElementById('yellow-row-template');
const grayInput = document.getElementById('gray-input');
const resultsCount = document.getElementById('results-count');
const resultsList = document.getElementById('results-list');

// ---------------------------------------------
// SECTION A: Green letters
// ---------------------------------------------
greenInputs.forEach((input, index) => {
  input.addEventListener('input', () => {
    // Force uppercase display, letters only
    input.value = input.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 1);
    updateYellowCheckboxAvailability();
    runFilter();

    // Auto-advance to the next box after typing a letter
    if (input.value && index < greenInputs.length - 1) {
      greenInputs[index + 1].focus();
    }
  });

  input.addEventListener('keydown', (e) => {
    // Backspace on an empty box moves to the previous box
    if (e.key === 'Backspace' && !input.value && index > 0) {
      greenInputs[index - 1].focus();
    }
  });
});

function getGreenLetters() {
  // Returns array of length 5: letter (lowercase) or null
  const arr = [null, null, null, null, null];
  greenInputs.forEach(input => {
    const pos = parseInt(input.dataset.pos, 10);
    const val = input.value.trim().toLowerCase();
    arr[pos] = val.length === 1 ? val : null;
  });
  return arr;
}

// ---------------------------------------------
// SECTION B: Yellow letters
// ---------------------------------------------
addYellowBtn.addEventListener('click', () => {
  addYellowRow();
});

function addYellowRow() {
  const fragment = yellowRowTemplate.content.cloneNode(true);
  const row = fragment.querySelector('.yellow-row');

  const letterInput = row.querySelector('.yellow-letter-input');
  letterInput.addEventListener('input', () => {
    letterInput.value = letterInput.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 1);
    runFilter();
  });

  const checkboxes = row.querySelectorAll('.yellow-pos-checkbox');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', runFilter);
  });

  const removeBtn = row.querySelector('.remove-yellow-btn');
  removeBtn.addEventListener('click', () => {
    row.remove();
    runFilter();
  });

  yellowEntriesContainer.appendChild(row);
  updateYellowCheckboxAvailability();
}

// Disable + uncheck + visually mark checkboxes for positions that are
// already locked in by a green letter, for every yellow row.
function updateYellowCheckboxAvailability() {
  const greens = getGreenLetters();
  const rows = yellowEntriesContainer.querySelectorAll('.yellow-row');
  rows.forEach(row => {
    const checkboxes = row.querySelectorAll('.yellow-pos-checkbox');
    checkboxes.forEach(cb => {
      const pos = parseInt(cb.dataset.pos, 10);
      if (greens[pos] !== null) {
        cb.checked = true;
        cb.disabled = true;
      } else {
        cb.disabled = false;
        // leave checked state as the user set it
      }
    });
  });
}

function getYellowConstraints() {
  // Returns array of { letter: 'r', forbiddenPositions: Set([0,2]) }
  const constraints = [];
  const rows = yellowEntriesContainer.querySelectorAll('.yellow-row');
  rows.forEach(row => {
    const letterInput = row.querySelector('.yellow-letter-input');
    const letter = letterInput.value.trim().toLowerCase();
    if (letter.length !== 1) return; // skip empty rows

    const forbiddenPositions = new Set();
    row.querySelectorAll('.yellow-pos-checkbox').forEach(cb => {
      if (cb.checked) {
        forbiddenPositions.add(parseInt(cb.dataset.pos, 10));
      }
    });

    constraints.push({ letter, forbiddenPositions });
  });
  return constraints;
}

// ---------------------------------------------
// SECTION C: Gray letters
// ---------------------------------------------
grayInput.addEventListener('input', () => {
  runFilter();
});

function getGrayLetters() {
  // Accepts comma/space separated letters, case-insensitive
  return grayInput.value
    .toLowerCase()
    .split(/[^a-z]/)
    .filter(ch => ch.length === 1);
}

// ---------------------------------------------
// Core filtering logic
// ---------------------------------------------
function wordMatches(word, greens, yellows, grays) {
  // --- Green check ---
  for (let i = 0; i < 5; i++) {
    if (greens[i] !== null && word[i] !== greens[i]) {
      return false;
    }
  }

  // --- Gray check ---
  for (const grayLetter of grays) {
    const isAlsoGreen = greens.includes(grayLetter);
    const isAlsoYellow = yellows.some(y => y.letter === grayLetter);
    if (isAlsoGreen || isAlsoYellow) {
      continue;
    }
    if (word.includes(grayLetter)) {
      return false;
    }
  }

  // --- Yellow check ---
  for (const { letter, forbiddenPositions } of yellows) {
    if (!word.includes(letter)) {
      return false;
    }
    for (const pos of forbiddenPositions) {
      if (word[pos] === letter) {
        return false;
      }
    }
  }

  return true;
}

function runFilter() {
  const greens = getGreenLetters();
  const yellows = getYellowConstraints();
  const grays = getGrayLetters();

  const matches = WORD_LIST.filter(word => wordMatches(word, greens, yellows, grays));

  resultsCount.textContent = `${matches.length} possible word${matches.length === 1 ? '' : 's'}`;
  resultsList.innerHTML = '';
  matches.forEach(word => {
    const span = document.createElement('span');
    span.className = 'result-word';
    span.textContent = word;
    resultsList.appendChild(span);
  });
}

// Initial render (in case word list loads before any interaction)
updateYellowCheckboxAvailability();

// ---------------------------------------------
// Help icon: tap to toggle on touch devices
// (hover and keyboard focus are handled in CSS)
// ---------------------------------------------
const helpEl = document.getElementById('help');
const helpIcon = document.getElementById('help-icon');

helpIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  helpEl.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!helpEl.contains(e.target)) {
    helpEl.classList.remove('open');
  }
});