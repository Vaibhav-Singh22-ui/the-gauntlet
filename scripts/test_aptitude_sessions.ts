import { ALL_GAME_TYPES } from '../src/lib/aptitude-games/registry';
import { startAptitudeGame, submitAptitudeAnswer } from '../src/lib/aptitude-games/session-manager';
import { generateAptitudePuzzle } from '../src/lib/aptitude-games/puzzle-service';

console.log('=== TESTING APTITUDE GAME SESSIONS END-TO-END ===\n');

for (const gameType of ALL_GAME_TYPES) {
  console.log(`Testing Game Session (Correct Answers): ${gameType}...`);
  const { session } = startAptitudeGame(gameType, 'MEDIUM');

  let currentRound = 1;
  let isDone = false;

  while (!isDone && currentRound <= 5) {
    const rawPuzzle = generateAptitudePuzzle(gameType, session.difficulty, session.seed, currentRound);

    let answer: any;
    if (gameType === 'NUMBER_SPRINT') {
      answer = rawPuzzle.correctAnswer;
    } else if (gameType === 'TARGET_24') {
      answer = rawPuzzle.knownSolutions[0];
    } else if (gameType === 'GRID_LOGIC') {
      answer = rawPuzzle.correctAnswer;
    } else if (gameType === 'MISSING_PIECE') {
      answer = rawPuzzle.correctCandidateIndex;
    } else if (gameType === 'ARRANGEMENT_MASTER') {
      answer = rawPuzzle.targetSolution;
    }

    const res = submitAptitudeAnswer(session, answer, 20);
    if (!res.correct) {
      throw new Error(`${gameType} Round ${currentRound} failed with answer ${answer}: ${res.explanation}`);
    }

    if (res.isGameComplete) {
      isDone = true;
      console.log(`   ✓ ${gameType} completed 5 rounds with final score: ${res.totalScore} pts, streak: ${res.streak}`);
    } else {
      currentRound = res.nextRound!;
    }
  }
}

console.log('\n--- TESTING INCORRECT ANSWER ROUND ADVANCEMENT ---');
for (const gameType of ALL_GAME_TYPES) {
  console.log(`Testing Game Session (Incorrect Answers): ${gameType}...`);
  const { session } = startAptitudeGame(gameType, 'HARD');

  let currentRound = 1;
  let isDone = false;

  while (!isDone && currentRound <= 5) {
    const wrongAnswer = gameType === 'TARGET_24' ? '1 + 1' : '999999';
    const res = submitAptitudeAnswer(session, wrongAnswer, 15);

    if (res.correct) {
      throw new Error(`Expected wrong answer to be marked incorrect!`);
    }

    if (res.isGameComplete) {
      isDone = true;
      console.log(`   ✓ ${gameType} successfully completed session even with incorrect answers. Rounds: ${session.round}`);
    } else {
      if (res.nextRound !== currentRound + 1) {
        throw new Error(`Expected nextRound to be ${currentRound + 1}, got ${res.nextRound}`);
      }
      currentRound = res.nextRound!;
    }
  }
}

console.log('\nALL 5 APTITUDE GAMES SIMULATED THROUGH TO COMPLETION CLEANLY (BOTH CORRECT & INCORRECT)!');
