let problem_elm = document.querySelector('#problem-box');

let running_elm = document.querySelector('#toggle-solve');
let instant_elm = document.querySelector('#solve');

let pre_compute_elm = document.querySelector('#pre-compute');

let prune_none_elm = document.querySelector('#no-prune');
let prune_elm = document.querySelector('#prune');
let prune_priority_elm = document.querySelector('#prune-priority');

let delay_elm = document.querySelector('#delay');
let delay_txt_elm = document.querySelector('#delay-text');

let input_sudoku_elm = document.querySelector('#input-puzzle');

let gen_puzzle_elm = document.querySelector('#gen-puzzle');
let gen_rand_puzzle_elm = document.querySelector('#gen-rand-puzzle');

let result_elm = document.querySelector('#result');

let running = false;
let delay = delay_elm.value;
let rows = null, cols = null, boxes = null;
let current_cell = null;

// generate html sudoku
let sudoku_elms = [];
for (let row = 0; row < 9; ++row) {
  sudoku_elms.push([]);
  for (let col = 0; col < 9; ++col) {
    let new_elm = document.createElement('div');
    new_elm.classList.add('sudoku-cell');
    sudoku_elms[row][col] = new_elm;
    problem_elm.appendChild(new_elm);
  }
}

// generate js sudoku
let sudoku = [];
for (let row = 0; row < 9; ++row) {
  sudoku.push(Array(9).fill(0));
}

let active = [];
for (let row = 0; row < 9; ++row) {
  active.push([]);
}

// for debug
input_sudoku_elm.value = '0 6 0 1 0 4 0 5 0\n\
0 0 8 3 0 5 6 0 0\n\
2 0 0 0 0 0 0 0 1\n\
8 0 0 4 0 7 0 0 6\n\
0 0 6 0 0 0 3 0 0\n\
7 0 0 9 0 1 0 0 4\n\
5 0 0 0 0 0 0 0 2\n\
0 0 7 2 0 6 9 0 0\n\
0 4 0 5 0 8 0 7 0';


delay_txt_elm.innerHTML = `${delay} ms`;

delay_elm.addEventListener('input', event => {
  delay = event.currentTarget.value;
  delay_txt_elm.innerHTML = `${delay} ms`;
  console.log(typeof delay);
});

gen_puzzle_elm.addEventListener('click', event => {
  input_sudoku(input_sudoku_elm.value);
  populate_sudoku_elms();
});

gen_rand_puzzle_elm.addEventListener('click', event => {
  generate_random_sudoku();
  populate_sudoku_elms();
});

instant_elm.addEventListener('click', event => {
  running = true;
  // setup active sudoku
  for (let row = 0; row < 9; ++row) {
    for (let col = 0; col < 9; ++col) {
      active[row][col] = sudoku[row][col];
    }
  }
  populate_sudoku_elms();
  instant_backtrack().then(result => {
    running = false;
  });
});

running_elm.addEventListener('click', event => {
  if (!running) {
    running_elm.innerHTML = 'Stop';
    // setup active sudoku
    for (let row = 0; row < 9; ++row) {
      for (let col = 0; col < 9; ++col) {
        active[row][col] = sudoku[row][col];
      }
    }
    running = true;
    populate_sudoku_elms();
    backtrack().then(resolved => {
      running_elm.innerHTML = 'Simulate';
      running = false;
    })
  } else {
    running_elm.innerHTML = 'Simulate';
    running = false;
  }
});

// hard coded sudoku
function input_sudoku(board) {
  try {
    let nums = board.trim().split(/\s+/);
    nums = nums.map(element => parseInt(element));
    let i = 0;
    for (let row = 0; row < 9; ++row) {
      for (let col = 0; col < 9; ++col) {
        sudoku[row][col] = nums[i];
        i++;
      }
    }
    console.log(sudoku);
  } catch {
    console.error('Failed to input sudoku, correct it.');
  }
}

function generate_random_sudoku() {
  // generate solved board
  console.error('generate_random_sudoku() is not implemented yet.');
}

function populate_sudoku_elms() {
  for (let row = 0; row < 9; ++row) {
    for (let col = 0; col < 9; ++col) {
      if (sudoku[row][col] != 0) {
        sudoku_elms[row][col].innerHTML = `${sudoku[row][col]}`;
        sudoku_elms[row][col].classList.add('cell-filled');
      } else {
        sudoku_elms[row][col].innerHTML = '';
        sudoku_elms[row][col].classList.remove('cell-attempt');
        sudoku_elms[row][col].classList.remove('cell-placed');
        sudoku_elms[row][col].classList.remove('cell-wrong');
        sudoku_elms[row][col].classList.remove('cell-filled');
      }
    }
  }
}

class Timer {
  Timer() {
    this.time = 0;
  }
  recordTime() {
    this.last_time = new Date();
  }
  addTime() {
    let next_time = new Date();
    this.time += next_time - this.last_time;
    this.last_time = next_time;
  }
};

let timer = new Timer();

function setup() {
  timer.time = 0;
  rows = [], cols = [], boxes = [];

  let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let sets = 0; sets < 9; ++sets) {
    rows.push(new Set(nums));
    cols.push(new Set(nums));
    boxes.push(new Set(nums));
  }
}

function index_box(r, c) {
  return (r - (r % 3)) + (c - (c % 3)) / 3;
}

function index_flat(r, c) {
  return r * 9 + c;
}



async function pre_compute() {
  // check for validity
  for (let row = 0; row < 9 && running; ++row) {
    for (let col = 0; col < 9 && running; ++col) {
      if (current_cell != null) {
        current_cell.classList.remove('cell-current');
      }
      
      if (active[row][col] != 0) {
        // a filled cell has duplicates in either the same row, column, or box
        if (!rows[row].delete(active[row][col])) {
          sudoku_elms[row][col].classList.add('cell-wrong');
          return false;
        }
        if (!cols[col].delete(active[row][col])) {
          sudoku_elms[row][col].classList.add('cell-wrong');
          return false;
        }
        if (!boxes[index_box(row, col)].delete(active[row][col])) {
          sudoku_elms[row][col].classList.add('cell-wrong');
          return false;
        }
      } else {
        // an empty cell has no possibilities
        let attempt = new Set();
        rows[row].forEach(element => {
          if (cols[col].has(element) && boxes[index_box(row, col)].has(element)) {
            attempt.add(element);
          }
        });
        if (attempt.size == 0) {
          sudoku_elms[row][col].classList.add('cell-wrong');
          return false;
        }
      }

      sudoku_elms[row][col].classList.add('cell-current');
      current_cell = sudoku_elms[row][col];
      if (delay > 0) await sleep(delay);
    }
  }
  if (current_cell != null) {
    current_cell.classList.remove('cell-current');
    current_cell = null;
  }

  // prefill all easy ones
  for (let row = 0; row < 9 && running; ++row) {
    for (let col = 0; col < 9 && running; ++col) {
      if (active[row][col] != 0) continue;

      let attempt = new Set();
      rows[row].forEach(element => {
        if (cols[col].has(element) && boxes[index_box(row, col)].has(element)) {
          attempt.add(element);
        }
      });
      if (attempt.size == 1) {
        if (current_cell != null) {
          current_cell.classList.remove('cell-current');
        }
        sudoku_elms[row][col].classList.add('cell-placed');
        sudoku_elms[row][col].classList.add('cell-current');
        current_cell = sudoku_elms[row][col];
        
        active[row][col] = attempt.values().next().value;
        sudoku_elms[row][col].innerHTML = `${active[row][col]}`;
        rows[row].delete(active[row][col]);
        cols[col].delete(active[row][col]);
        boxes[index_box(row, col)].delete(active[row][col]);
        
        if (delay > 0) await sleep(delay);
      }
    }
  }
  if (current_cell != null) {
    current_cell.classList.remove('cell-current');
  }
  return true;
}

async function dfs(r, c) {
  if (!running) return false;
  if (r >= 9) {
    let rows_f = [], cols_f = [], boxes_f = [];
    for (let sets = 0; sets < 9; ++sets) {
      rows_f.push(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
      cols_f.push(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
      boxes_f.push(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
    }

    for (let row = 0; row < 9 && running; ++row) {
      for (let col = 0; col < 9 && running; ++col) {
        // not a valid solution
        if (!rows_f[row].delete(active[row][col]) ||
            !cols_f[col].delete(active[row][col]) ||
            !boxes_f[index_box(row, col)].delete(active[row][col])) {
              return false;
            }
      }
    }
    return true;
  }

  let nr = r, nc = c + 1;
  if (nc >= 9) {
    nr = r + 1, nc = 0;
  }

  // value already set, skip
  if (active[r][c] != 0) {
    if (running && await dfs(nr, nc)) {
      return true;
    } else {
      return false;
    }
  }

  for (let value = 1; value < 10 && running; ++value) {
    active[r][c] = value;
    sudoku_elms[r][c].innerHTML = `${value}`;
    sudoku_elms[r][c].classList.add('cell-current');
    if (delay > 0) await sleep(delay);
    sudoku_elms[r][c].classList.replace('cell-current', 'cell-attempt');
    if (running && await dfs(nr, nc)) {
      sudoku_elms[r][c].classList.add('cell-placed');
      if (delay > 0) await sleep(delay);
      return true;
    }
    active[r][c] = 0;
    sudoku_elms[r][c].innerHTML = '';
  }
  sudoku_elms[r][c].classList.remove('cell-attempt');
  return false;
}

async function dfs_prune(r, c) {
  timer.recordTime();
  if (!running) return false;
  // check for full solution, sanity check
  if (r >= 9) {
    let rows_f = [], cols_f = [], boxes_f = [];
    for (let sets = 0; sets < 9 && running; ++sets) {
      rows_f.push(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
      cols_f.push(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
      boxes_f.push(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
    }

    for (let row = 0; row < 9 && running; ++row) {
      for (let col = 0; col < 9 && running; ++col) {
        // not a valid solution
        if (!rows_f[row].delete(active[row][col]) ||
            !cols_f[col].delete(active[row][col]) ||
            !boxes_f[index_box(row, col)].delete(active[row][col])) {
              return false;
            }
      }
    }
    return true;
  }

  let nr = r, nc = c + 1;
  if (nc >= 9) {
    nr = r + 1, nc = 0;
  }

  // value already set, skip
  if (active[r][c] != 0) {
    timer.addTime();
    if (running && await dfs_prune(nr, nc)) {
      return true;
    } else {
      return false;
    }
  }

  let attempt = new Set();
  rows[r].forEach(element => {
    if (cols[c].has(element) && boxes[index_box(r, c)].has(element)) {
      attempt.add(element);
    }
  });

  for (const value of attempt) {
    active[r][c] = value;
    rows[r].delete(value);
    cols[c].delete(value);
    boxes[index_box(r, c)].delete(value);
    sudoku_elms[r][c].innerHTML = `${value}`;
    sudoku_elms[r][c].classList.add('cell-current');
    timer.addTime();
    if (delay > 0) await sleep(delay);
    timer.recordTime();
    sudoku_elms[r][c].classList.replace('cell-current', 'cell-attempt');

    if (running && await dfs_prune(nr, nc)) {
      sudoku_elms[r][c].classList.add('cell-placed');
      timer.addTime();
      if (delay > 0) await sleep(delay);
      timer.recordTime();
      return true;
    }

    active[r][c] = 0;
    rows[r].add(value);
    cols[c].add(value);
    boxes[index_box(r, c)].add(value);
    sudoku_elms[r][c].innerHTML = '';
  }
  sudoku_elms[r][c].classList.remove('cell-attempt');
  timer.addTime();
  return false;
}

async function dfs_prune_more(r, c) {
  timer.recordTime();
  if (!running) return false;
  // check for full solution, sanity check
  if (r >= 9) {
    let rows_f = [], cols_f = [], boxes_f = [];
    for (let sets = 0; sets < 9 && running; ++sets) {
      rows_f.push(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
      cols_f.push(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
      boxes_f.push(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
    }

    for (let row = 0; row < 9 && running; ++row) {
      for (let col = 0; col < 9 && running; ++col) {
        // not a valid solution
        if (!rows_f[row].delete(active[row][col]) ||
            !cols_f[col].delete(active[row][col]) ||
            !boxes_f[index_box(row, col)].delete(active[row][col])) {
              return false;
            }
      }
    }
    return true;
  }

  let nr = r, nc = c + 1, best_prob;
  if (nc >= 9) {
    nr = r + 1, nc = 0;
  }

  // value already set, skip
  if (active[r][c] != 0) {
    timer.addTime();
    if (running && await dfs_prune(nr, nc)) {
      return true;
    } else {
      return false;
    }
  }

  let attempt = new Set();
  rows[r].forEach(element => {
    if (cols[c].has(element) && boxes[index_box(r, c)].has(element)) {
      attempt.add(element);
    }
  });

  for (const value of attempt) {
    active[r][c] = value;
    rows[r].delete(value);
    cols[c].delete(value);
    boxes[index_box(r, c)].delete(value);
    sudoku_elms[r][c].innerHTML = `${value}`;
    sudoku_elms[r][c].classList.add('cell-current');
    timer.addTime();
    if (delay > 0) await sleep(delay);
    timer.recordTime();
    sudoku_elms[r][c].classList.replace('cell-current', 'cell-attempt');

    nr = 9, nc = 9, best_prob = 9;
    for (let row = 0; row < 9; ++row) {
      for (let col = 0; col < 9; ++col) {
        if (active[row][col] != 0) continue;
  
        let next_attempt = new Set();
        rows[row].forEach(element => {
          if (cols[col].has(element) && boxes[index_box(row, col)].has(element)) {
            next_attempt.add(element);
          }
        });
        if (next_attempt.size < best_prob) {
          nr = row, nc = col, best_prob = attempt.size;
        }
      }
    }

    if (running && await dfs_prune_more(nr, nc)) {
      sudoku_elms[r][c].classList.add('cell-placed');
      timer.addTime();
      if (delay > 0) await sleep(delay);
      timer.recordTime();
      return true;
    }

    active[r][c] = 0;
    rows[r].add(value);
    cols[c].add(value);
    boxes[index_box(r, c)].add(value);
    sudoku_elms[r][c].innerHTML = '';
  }
  sudoku_elms[r][c].classList.remove('cell-attempt');
  timer.addTime();
  return false;
}

function displayResult(result, show_time=true) {
  result_elm.innerHTML = result + (show_time ? ` Took ${timer.time} ms.` : '');
  result_elm.classList.toggle('hidden');
  setTimeout(element => {result_elm.classList.toggle('hidden');}, 3000);
}

async function instant_backtrack() {
  let delay_saved = delay;
  delay = 0;
  setup();
  if (await pre_compute()) {
  } else {
    displayResult('Invalid Puzzle. Impossible to solve.', false);
    delay = delay_saved;
    return false;
  }

  if (await dfs_prune_more(0, 0)) {
    displayResult('Puzzle Solved!', false);
    delay = delay_saved;
    return true;
  } else {
    displayResult('Puzzle Unsolved :(', false);
  }
  delay = delay_saved;
}

async function backtrack() {
  setup();
  if (pre_compute_elm.checked) {
    if (await pre_compute()) {
      displayResult('Valid Puzzle. Solving...', false);
    } else {
      displayResult('Invalid Puzzle. Impossible to solve.', false);
      return false;
    }
  } else displayResult('Not Pre-Computing? Your funeral.', false);

  if (prune_priority_elm.checked) {
    if (await dfs_prune_more(0, 0)) {
      displayResult('Puzzle Solved!');
      return true;
    } else {
      displayResult('Puzzle Unsolved :(', false);
    }
  } else if (prune_elm.checked) {
    if (await dfs_prune(0, 0)) {
      displayResult('Puzzle Solved!');
      return true;
    } else {
      displayResult('Puzzle Unsolved :(', false);
    }
  } else if (prune_none_elm.checked) {
    if (await dfs(0, 0)) {
      displayResult('Puzzle Solved!');
      return true;
    } else {
      displayResult('Puzzle Unsolved :(', false);
    }
  }

}

function sleep(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
