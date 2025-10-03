const gridContainer = document.getElementById('sudoku-grid');
const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const leaderboardList = document.getElementById('leaderboard-list');

let timer, seconds = 0, paused = true;
let score = 0, correctCount = 0;
let sudoku = [], solution = [];
let maxCorrect = 5;

const baseSudoku = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],
  [4,2,6,8,5,3,7,9,1],
  [7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],
  [2,8,7,4,1,9,6,3,5],
  [3,4,5,2,8,6,1,7,9]
];

function startTimer(){
    clearInterval(timer);
    timer = setInterval(()=>{
        if(!paused){
            seconds++;
            let mins = String(Math.floor(seconds/60)).padStart(2,'0');
            let secs = String(seconds%60).padStart(2,'0');
            timeDisplay.textContent = `${mins}:${secs}`;
        }
    },1000);
}

function generateSudoku(difficulty='easy'){
    gridContainer.innerHTML='';
    sudoku = JSON.parse(JSON.stringify(baseSudoku));
    correctCount = 0;
    score = 0;
    scoreDisplay.textContent = score;

    let removeCount = difficulty==='easy'?30:difficulty==='medium'?40:50;
    for(let i=0;i<removeCount;i++){
        let r=Math.floor(Math.random()*9);
        let c=Math.floor(Math.random()*9);
        sudoku[r][c]=0;
    }
    solution = JSON.parse(JSON.stringify(baseSudoku));

    for(let row=0;row<9;row++){
        for(let col=0;col<9;col++){
            const input = document.createElement('input');
            input.type='text';
            input.maxLength=1;
            const blockIndex = Math.floor(row/3)*3 + Math.floor(col/3);
            input.classList.add(`block-color-${blockIndex%4}`);

            if(sudoku[row][col]!==0){
                input.value = sudoku[row][col];
                input.classList.add('prefilled');
                input.disabled = true;
            } else {
                input.addEventListener('input',(e)=>{
                    if(paused) return;
                    let val=parseInt(e.target.value);
                    let r=parseInt(input.dataset.row);
                    let c=parseInt(input.dataset.col);

                    if(isNaN(val)||val<1||val>9){
                        e.target.value='';
                        return;
                    }

                    if(val===solution[r][c]){
                        e.target.style.backgroundColor='#d4edda';
                        e.target.disabled=true;
                        correctCount++;
                        score+=20;
                        scoreDisplay.textContent=score;
                        if(correctCount>=maxCorrect) endGame();
                    } else {
                        e.target.style.backgroundColor='#f8d7da';
                        setTimeout(()=>{ e.target.value=''; e.target.style.backgroundColor='white'; },800);
                    }
                });
            }
            input.dataset.row=row;
            input.dataset.col=col;
            gridContainer.appendChild(input);
        }
    }
    document.getElementById('message').textContent='';
}

function giveHint(){
    if(paused) return;
    const inputs = gridContainer.querySelectorAll('input');
    let emptyCells = [];
    inputs.forEach(input=>{ if(input.value==='') emptyCells.push(input); });
    if(emptyCells.length>0){
        const randCell = emptyCells[Math.floor(Math.random()*emptyCells.length)];
        let r=parseInt(randCell.dataset.row);
        let c=parseInt(randCell.dataset.col);
        randCell.value = solution[r][c];
        randCell.style.backgroundColor='#fff176';
        setTimeout(()=>randCell.style.backgroundColor='white',800);
    }
}

function endGame(){
    paused=true;
    clearInterval(timer);
    document.getElementById('message').textContent=`🎉 Game Over! Final Score: ${score}`;
    const inputs = gridContainer.querySelectorAll('input');
    inputs.forEach(input=>input.disabled=true);
    saveScore(score);
    updateLeaderboardUI();
}

function saveScore(newScore){
    let scores = JSON.parse(localStorage.getItem('sudokuScores'))||[];
    scores.push(newScore);
    scores.sort((a,b)=>b-a);
    scores = scores.slice(0,5);
    localStorage.setItem('sudokuScores',JSON.stringify(scores));
}

function updateLeaderboardUI(){
    let scores = JSON.parse(localStorage.getItem('sudokuScores'))||[];
    leaderboardList.innerHTML='';
    scores.forEach((s,i)=>{
        const li = document.createElement('li');
        li.textContent=`${i+1}. ${s}`;
        leaderboardList.appendChild(li);
    });
}

// Button Events
document.getElementById('startGame').addEventListener('click',()=>{
    paused=false;
    generateSudoku(document.getElementById('difficultyText').textContent);
    startTimer();
});

document.getElementById('pauseResume').addEventListener('click',()=>{
    paused = !paused;
    document.getElementById('pauseResume').textContent = paused ? 'Resume' : 'Pause';
});

document.getElementById('endGame').addEventListener('click', endGame);
