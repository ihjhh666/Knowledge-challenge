const fs = require('fs');
let code = fs.readFileSync('src/pages/PenaltySolo.tsx', 'utf8');

code = code.replace(/PenaltySolo/g, "PenaltyRoom");

code = code.replace(/import \{ useNavigate \} from 'react-router-dom';/, `import { useNavigate } from 'react-router-dom';
import { useGame } from '../components/GameContext';`);

// Remove game state useStates
const statesToRemove = [
  /const \[gameState.*?\] = useState.*?;/g,
  /const \[difficulty.*?\] = useState.*?;/g,
  /const \[currentRound.*?\] = useState.*?;/g,
  /const \[turnRole.*?\] = useState.*?;/g,
  /const \[playerScore.*?\] = useState.*?;/g,
  /const \[botScore.*?\] = useState.*?;/g,
  /const \[history.*?\] = useState.*?;/g,
  /const \[isSuddenDeath.*?\] = useState.*?;/g,
  /const \[timeLeft.*?\] = useState.*?;/g,
  /const \[currentStreak.*?\] = useState.*?;/g,
  /const \[maxStreak.*?\] = useState.*?;/g
];

for(let r of statesToRemove) {
  code = code.replace(r, "");
}

code = code.replace(/const navigate = useNavigate\(\);/, `const navigate = useNavigate();
  const { state, playerId, sendPenaltyAction, startGame, changeGameMode, leaveRoom } = useGame();

  if (state?.gameMode !== 'penalty') return null;

  const pst = state?.penaltyState;
  const isPlaying = state?.status === 'playing';
  const isFinished = state?.status === 'finished';
  
  const gameState = isFinished ? 'results' : (isPlaying ? 'playing' : 'setup');
  const currentRound = state?.round || 1;
  const turnRole = pst?.kickerId === playerId ? 'kicker' : 'goalie';
  const currentStreak = 0;
  const maxStreak = 0;
  const isSuddenDeath = (state?.totalRounds || 10) > 10;
  const timeLeft = pst?.countdown;
  
  const myPlayer = state?.players[playerId];
  const allPl = Object.values(state?.players || {});
  const opp = allPl.find(p => p.id !== playerId) || allPl[0];
  
  const playerScore = myPlayer?.score || 0;
  const botScore = opp?.score || 0;
  
  const history = pst?.history || [];
  
  const amReady = (turnRole === 'kicker') ? pst?.kickerReady : pst?.goalieReady;
  const oppReady = (turnRole === 'kicker') ? pst?.goalieReady : pst?.kickerReady;

  const canSelect = gameState === 'playing' && kickState === 'idle' && !amReady && timeLeft === undefined;
`);

code = code.replace(/const startGame =.*?};/gs, ""); 

fs.writeFileSync('src/pages/PenaltyRoom.tsx', code);
console.log("Rewrite done!");
