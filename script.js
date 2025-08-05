// Responsive Tic-Tac-Toe logic with popup, undo, hint, and scoring.

document.addEventListener('DOMContentLoaded', () => {
  const cells = Array.from(document.querySelectorAll('.cell'));
  const turnEl = document.getElementById('turn');
  const restartBtn = document.getElementById('restartBtn');
  const newRoundBtn = document.getElementById('newRoundBtn');
  const undoBtn = document.getElementById('undoBtn');
  const autoFillBtn = document.getElementById('autoFillBtn');

  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMsg = document.getElementById('modalMsg');
  const modalPlayBtn = document.getElementById('modalPlayBtn');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');
  const scoreDEl = document.getElementById('scoreD');

  let board = Array(9).fill(null);
  let current = 'X';
  let history = []; // indexes of moves
  let scores = { X: 0, O: 0, D: 0 };

  const WIN = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function init() {
    cells.forEach((c,i) => {
      c.textContent = '';
      c.classList.remove('x','o','win');
      c.disabled = false;
      c.addEventListener('click', onClick);
      c.addEventListener('keydown', onKeyDown);
      c.setAttribute('tabindex', '0');
    });
    board.fill(null);
    current = 'X';
    history = [];
    updateTurn();
    clearModal();
    updateScoresUI();
  }

  function updateTurn(){ turnEl.textContent = current; turnEl.style.color = current === 'X' ? 'var(--accent-x)' : '#062030'; }

  function onKeyDown(e){ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.target.click(); } }

  function onClick(e){
    const idx = Number(e.currentTarget.dataset.index);
    if (board[idx] || checkWinner()) return;
    makeMove(idx, current);
    history.push(idx);
    const res = checkWinner();
    if (res) { finishGame(res); return; }
    if (board.every(Boolean)) { drawGame(); return; }
    current = current === 'X' ? 'O' : 'X';
    updateTurn();
  }

  function makeMove(i, player){
    board[i] = player;
    const el = cells[i];
    el.textContent = player;
    el.classList.add(player.toLowerCase());
  }

  function checkWinner(){
    for (const combo of WIN){
      const [a,b,c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], combo };
      }
    }
    return null;
  }

  function finishGame({ winner, combo }){
    combo.forEach(i => cells[i].classList.add('win'));
    cells.forEach(c => c.removeEventListener('click', onClick));
    scores[winner] += 1;
    updateScoresUI();
    showModal(`Player ${winner} wins!`, `Nice! Player ${winner} completed three-in-a-row.`);
  }

  function drawGame(){
    scores.D += 1;
    updateScoresUI();
    showModal("It's a draw", "No winner this round.");
  }

  function updateScoresUI(){
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
    scoreDEl.textContent = scores.D;
  }

  // Controls
  undoBtn.addEventListener('click', () => {
    if (history.length === 0 || checkWinner()) return;
    const last = history.pop();
    board[last] = null;
    const el = cells[last];
    el.textContent = '';
    el.classList.remove('x','o','win');
    current = current === 'X' ? 'O' : 'X';
    updateTurn();
    // reattach listeners if removed
    cells.forEach((c) => {
      if(!c.onclick) c.addEventListener('click', onClick);
    });
    // clear win highlights
    cells.forEach(c => c.classList.remove('win'));
  });

  newRoundBtn.addEventListener('click', () => init());
  restartBtn.addEventListener('click', () => { scores = { X:0, O:0, D:0 }; updateScoresUI(); init(); });

  // Hint: pick center -> corner -> side
  autoFillBtn.addEventListener('click', () => {
    const free = board.map((v,i)=>v?null:i).filter(Number.isFinite);
    if (!free.length) return;
    const prefer = [4,0,2,6,8,1,3,5,7];
    const choice = prefer.find(i => free.includes(i));
    if (choice !== undefined) {
      makeMove(choice, current);
      history.push(choice);
      const res = checkWinner();
      if (res) { finishGame(res); return; }
      if (board.every(Boolean)) { drawGame(); return; }
      current = current === 'X' ? 'O' : 'X';
      updateTurn();
    }
  });

  // modal handlers
  modalPlayBtn.addEventListener('click', () => { clearModal(); init(); });
  modalCloseBtn.addEventListener('click', () => clearModal());
  modal.addEventListener('click', (e) => { if (e.target === modal) clearModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') clearModal(); });

  function showModal(title, message){
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMsg').textContent = message;
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    modalPlayBtn.focus();
  }
  function clearModal(){
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
  }

  // footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // start
  init();
});
