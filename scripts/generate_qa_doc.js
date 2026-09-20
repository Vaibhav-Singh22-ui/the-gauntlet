const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'questions_master_1000.json');
const outputPath = path.join(__dirname, '..', 'ALL_QUESTIONS_AND_ANSWERS.md');

const questions = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let md = `# THE GAUNTLET — COMPLETE QUESTION BANK MASTER (1,000 QUESTIONS & ANSWERS)

> **Official Stall Question Master**
> Total Questions: **1,000**
> Levels: **1 to 15**
> Colors: **RED, BLUE, GREEN, YELLOW, PINK, VIOLET**
> Format: Question, Options [A, B, C, D], Verified Answer, Hint/Clue

---

`;

// Group by Level
const byLevel = {};
for (let i = 1; i <= 15; i++) byLevel[i] = [];
questions.forEach((q) => {
  if (byLevel[q.level]) byLevel[q.level].push(q);
});

for (let lvl = 1; lvl <= 15; lvl++) {
  const lvlQuestions = byLevel[lvl] || [];
  md += `\n## LEVEL ${lvl} (${lvlQuestions.length} Questions)\n\n`;
  md += `| ID | Color | Difficulty | Question | Options | Correct Answer | Hint |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  lvlQuestions.forEach((q, idx) => {
    const cleanQ = q.question_text.replace(/\|/g, '\\|');
    const opts = `**A:** ${q.option_a}<br>**B:** ${q.option_b}<br>**C:** ${q.option_c}<br>**D:** ${q.option_d}`.replace(/\|/g, '\\|');
    const correctVal = q[`option_${q.correct_option.toLowerCase()}`];
    const correctStr = `**[${q.correct_option}]** ${correctVal}`.replace(/\|/g, '\\|');
    const cleanHint = (q.hint_text || '').replace(/\|/g, '\\|');

    md += `| **${q.id}** | \`${q.color}\` | ${q.difficulty} | ${cleanQ} | ${opts} | ${correctStr} | ${cleanHint} |\n`;
  });
}

fs.writeFileSync(outputPath, md, 'utf8');
console.log(`Generated ${outputPath} with ${questions.length} questions.`);
