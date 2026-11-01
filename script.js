// Wordle Solver - script.js

let WORD_LIST = [];

// Load the word list from words.json
fetch('words.json')
  .then(response => response.json())
  .then(data => {
    // Lowercase, remove duplicates, keep only 5-letter words
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
// Page elements
// ---------------------------------------------
const greenInputs = document.querySelectorAll('.green-input');
const yellowEntriesContainer = document.getElementById('yellow-entries');
const addYellowBtn = document.getElementById('add-yellow-btn');
const yellowRowTemplate = document.getElementById('yellow-row-template');
const grayContainer = document.getElementById('gray-inputs');
const resultsCount = document.getElementById('results-count');
const resultsList = document.getElementById('results-list');

const GRAY_BOX_COUNT = 30;
const grayInputs = [];

// ---------------------------------------------
// Green letters
// ---------------------------------------------
greenInputs.forEach((input, index) => {
  input.addEventListener('input', () => {
    // Letters only, shown uppercase
    input.value = input.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 1);
    input.classList.toggle('filled', input.value !== '');
    updateYellowCheckboxAvailability();
    runFilter();

    // Jump to the next box after typing a letter
    if (input.value && index < greenInputs.length - 1) {
      greenInputs[index + 1].focus();
    }
  });

  input.addEventListener('keydown', (e) => {
    // Backspace on an empty box goes back one box
    if (e.key === 'Backspace' && !input.value && index > 0) {
      greenInputs[index - 1].focus();
    }
  });
});

function getGreenLetters() {
  // Array of 5: a lowercase letter or null
  const arr = [null, null, null, null, null];
  greenInputs.forEach(input => {
    const pos = parseInt(input.dataset.pos, 10);
    const val = input.value.trim().toLowerCase();
    arr[pos] = val.length === 1 ? val : null;
  });
  return arr;
}

// ---------------------------------------------
// Yellow letters
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
    letterInput.classList.toggle('filled', letterInput.value !== '');
    runFilter();
  });

  row.querySelectorAll('.yellow-pos-checkbox').forEach(cb => {
    cb.addEventListener('change', runFilter);
  });

  row.querySelector('.remove-yellow-btn').addEventListener('click', () => {
    row.remove();
    runFilter();
  });

  yellowEntriesContainer.appendChild(row);
  updateYellowCheckboxAvailability();
}

// Spots with a green letter are checked and locked in every yellow row
function updateYellowCheckboxAvailability() {
  const greens = getGreenLetters();
  yellowEntriesContainer.querySelectorAll('.yellow-row').forEach(row => {
    row.querySelectorAll('.yellow-pos-checkbox').forEach(cb => {
      const pos = parseInt(cb.dataset.pos, 10);
      if (greens[pos] !== null) {
        cb.checked = true;
        cb.disabled = true;
      } else {
        cb.disabled = false;
      }
    });
  });
}

function getYellowConstraints() {
  // Array of { letter: 'r', forbiddenPositions: Set([0, 2]) }
  const constraints = [];
  yellowEntriesContainer.querySelectorAll('.yellow-row').forEach(row => {
    const letter = row.querySelector('.yellow-letter-input').value.trim().toLowerCase();
    if (letter.length !== 1) return; // empty row, no restriction

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
// Gray letters (30 single-letter boxes)
// ---------------------------------------------
for (let i = 0; i < GRAY_BOX_COUNT; i++) {
  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 1;
  input.className = 'gray-input';
  input.autocomplete = 'off';
  input.setAttribute('aria-label', 'Gray letter ' + (i + 1));

  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 1);
    input.classList.toggle('filled', input.value !== '');
    runFilter();

    // Jump to the next box after typing a letter
    if (input.value && i < GRAY_BOX_COUNT - 1) {
      grayInputs[i + 1].focus();
    }
  });

  input.addEventListener('keydown', (e) => {
    // Backspace on an empty box goes back one box
    if (e.key === 'Backspace' && !input.value && i > 0) {
      grayInputs[i - 1].focus();
    }
  });

  grayContainer.appendChild(input);
  grayInputs.push(input);
}

function getGrayLetters() {
  // Every filled gray box, lowercase
  return grayInputs
    .map(input => input.value.trim().toLowerCase())
    .filter(letter => letter !== '');
}

// ---------------------------------------------
// Filtering
// ---------------------------------------------
function wordMatches(word, greens, yellows, grays) {
  // Green: exact letter in exact spot
  for (let i = 0; i < 5; i++) {
    if (greens[i] !== null && word[i] !== greens[i]) {
      return false;
    }
  }

  // Gray: letter can't be in the word, unless it's also green/yellow
  // (that happens when a guess has a repeated letter)
  for (const grayLetter of grays) {
    const isAlsoGreen = greens.includes(grayLetter);
    const isAlsoYellow = yellows.some(y => y.letter === grayLetter);
    if (isAlsoGreen || isAlsoYellow) continue;
    if (word.includes(grayLetter)) return false;
  }

  // Yellow: must contain the letter, but not in the blocked spots
  for (const { letter, forbiddenPositions } of yellows) {
    if (!word.includes(letter)) return false;
    for (const pos of forbiddenPositions) {
      if (word[pos] === letter) return false;
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
    const div = document.createElement('div');
    div.className = 'result-word';
    div.textContent = word;
    resultsList.appendChild(div);
  });
}

// Start up
updateYellowCheckboxAvailability();