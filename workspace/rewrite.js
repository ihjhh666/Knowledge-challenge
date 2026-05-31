const fs = require('fs');
let code = fs.readFileSync('src/pages/PenaltySolo.tsx', 'utf8');

code = code.replace(/PenaltySolo/g, "PenaltyRoom");

code = code.replace(/import \{ useNavigate \} from 'react-router-dom';/, `import { useNavigate } from 'react-router-dom';
import { useGame } from '../components/GameContext';`);

// Remove game state useStates
const statesToRemove = [
  /const \[gameState.*?;/g,
  /const \[difficulty.*?;/g,
  /const \[currentRound.*?;/g,
  /const \[turnRole.*?;/g,
  /const \[playerScore.*?;/g,
  /const \[botScore.*?;/g,
  /const \[history.*?;/g,
  /const \[isSuddenDeath.*?;/g,
  /const \[timeLeft.*?;/g,
  /const \[currentStreak.*?;/g,
  /const \[maxStreak.*?;/g
];

for(let r of statesToRemove) {
  code = code.replace(r, "");
}

code = code.replace(/const navigate = useNavigate\(\);/, `const navigate = useNavigate();
  const { state, playerId, sendPenaltyAction, startGame: startAg, changeGameMode, leaveRoom } = useGame();

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
  const timeLeft = pst?.countdown || 0;
  
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

code = code.replace(/const startGame = \(.*?\} \};/g, ""); // Remove startGame
code = code.replace(/const handleTimeOut = \(\) => {.*?};/gs, "");
code = code.replace(/const getBotDecision = \(.*?};/gs, "");

// Modify handlePlayerAction
code = code.replace(/const handlePlayerAction = \(dir: Direction\) => \{.*?const startAnimation/gs, 
`const handlePlayerAction = (dir: Direction) => {
    if (!canSelect) return;
    sendPenaltyAction(turnRole, dir);
  };

  useEffect(() => {
    if (history.length > 0) {
      const last = history[history.length - 1];
      if (last && kickStateRef.current === 'idle') {
        const myDir = turnRole === 'kicker' ? last.kickerDir : last.goalieDir;
        const oppDir = turnRole === 'kicker' ? last.goalieDir : last.kickerDir;
        if (myDir && oppDir) {
          startAnimation(
            turnRole === 'kicker' ? myDir : oppDir, 
            turnRole === 'kicker' ? oppDir : myDir, 
            false, false
          );
        }
      }
    }
  }, [history.length]);

  const startAnimation`);

fs.writeFileSync('src/pages/PenaltyRoom.tsx', code);
console.log("Rewrite done!");
