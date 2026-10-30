let WORD_LIST = [];

fetch ('words.json')
.then(response => response.json())
.then(data => {
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
    console.error('Error loading words.json:', err);
    document.getElementById('results-count').textContent = 'Error loading word list';
});

// dom references


const greenInputs = document.querySelectorAll('.green-input');
const yellowEntriesContainer = document.getElementById('yellow-entries');
const addYellowBtn = document.getElementById('add-yellow-btn');
const yellowRowTemplate = document.getElementById('yellow-row-template');
const grayInput = document.getElementById('gray-input');
const resultsCount = document.getElementById('results-count');
const resultsList = document.getElementById('results-list');

// Green Letters

greenInputs.forEach(input => {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0,1);
        updateYellowCheckboxAvailability();
        runFilter();
});
});

function getGreenLetters() {
    const arr = [null, null, null, null, null];
    greenInputs.forEach(input => {
        const pos = parseInt(input.dataset.pos, 10);
        const val = input.value.trim().toLowerCase();
        arr[pos] = val.length === 1 ? val : null;
    });
    return arr;
}

// Yellow Letters

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

// Gray Letters

grayInput.addEventListener('input', () => {
  runFilter();
});

function getGrayLetters(){

  return grayInput.value
  .toLowerCase()
  .split(/[^a-z]/)
  .filter(ch => ch.length === 1);
}

// filtering

function wordMatches(word, greens, yellows, grays) {
  for (let i = 0; i < 5; i++) {
    if (greens[i] !== null && word[i] !== greens[i]) {
      return false;
  }
}
}

for (const grayLetter of grays) {
  const isAlsoGreen = greens.includes(grayLetter);
  const isAlsoYellow = yellow.some(y => y.letter === grayLetter);
  if (isAlsoGreen || isAlsoYellow) {
    continue;
  }
  if (word.includes(grayLetters)) {
    return false;
  }
}