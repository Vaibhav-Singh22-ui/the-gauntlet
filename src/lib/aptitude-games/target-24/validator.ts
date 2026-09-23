import { Target24Puzzle } from '../types';

/**
 * Safe Fraction class to eliminate floating point rounding inaccuracies in Target 24
 * e.g. 8 / (3 - 8/3) -> 8 / (1/3) -> 24
 */
export class Fraction {
  num: number;
  den: number;

  constructor(num: number, den: number = 1) {
    if (den === 0) throw new Error('Division by zero');
    const g = this.gcd(Math.abs(num), Math.abs(den));
    const sign = (num * den < 0) ? -1 : 1;
    this.num = sign * (Math.abs(num) / g);
    this.den = Math.abs(den) / g;
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  add(other: Fraction): Fraction {
    return new Fraction(this.num * other.den + other.num * this.den, this.den * other.den);
  }

  sub(other: Fraction): Fraction {
    return new Fraction(this.num * other.den - other.num * this.den, this.den * other.den);
  }

  mul(other: Fraction): Fraction {
    return new Fraction(this.num * other.num, this.den * other.den);
  }

  div(other: Fraction): Fraction {
    if (other.num === 0) throw new Error('Division by zero');
    return new Fraction(this.num * other.den, this.den * other.num);
  }

  toNumber(): number {
    return this.num / this.den;
  }

  equalsInt(target: number): boolean {
    return this.den === 1 && this.num === target;
  }
}

/**
 * Safe Recursive Descent Expression Parser for basic arithmetic (+, -, *, /) and parentheses.
 * Evaluates in exact fractions.
 */
class ExpressionParser {
  private tokens: string[] = [];
  private pos = 0;

  constructor(expr: string) {
    // Normalize symbols
    const clean = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\s+/g, '');

    // Tokenize
    const regex = /(\d+|\+|\-|\*|\/|\(|\))/g;
    const matches = clean.match(regex);
    if (!matches || matches.join('') !== clean) {
      throw new Error('Expression contains invalid characters or malformed tokens.');
    }
    this.tokens = matches;
  }

  parse(): Fraction {
    this.pos = 0;
    const res = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new Error('Unexpected token after end of expression: ' + this.tokens[this.pos]);
    }
    return res;
  }

  // expr -> term ((+ | -) term)*
  private parseExpression(): Fraction {
    let result = this.parseTerm();
    while (this.pos < this.tokens.length) {
      const op = this.tokens[this.pos];
      if (op === '+' || op === '-') {
        this.pos++;
        const nextTerm = this.parseTerm();
        result = op === '+' ? result.add(nextTerm) : result.sub(nextTerm);
      } else {
        break;
      }
    }
    return result;
  }

  // term -> factor ((* | /) factor)*
  private parseTerm(): Fraction {
    let result = this.parseFactor();
    while (this.pos < this.tokens.length) {
      const op = this.tokens[this.pos];
      if (op === '*' || op === '/') {
        this.pos++;
        const nextFactor = this.parseFactor();
        result = op === '*' ? result.mul(nextFactor) : result.div(nextFactor);
      } else {
        break;
      }
    }
    return result;
  }

  // factor -> NUMBER | ( expr )
  private parseFactor(): Fraction {
    if (this.pos >= this.tokens.length) {
      throw new Error('Unexpected end of expression.');
    }
    const token = this.tokens[this.pos++];

    if (token === '(') {
      const result = this.parseExpression();
      if (this.pos >= this.tokens.length || this.tokens[this.pos] !== ')') {
        throw new Error('Missing closing parenthesis.');
      }
      this.pos++; // consume ')'
      return result;
    }

    if (/^\d+$/.test(token)) {
      return new Fraction(parseInt(token, 10), 1);
    }

    throw new Error('Expected number or "(" but found: ' + token);
  }
}

/**
 * Validates a user's Target 24 expression against the puzzle requirements
 */
export function validateTarget24Answer(
  puzzle: Target24Puzzle,
  expression: string
): { correct: boolean; explanation: string; value?: number } {
  if (!expression || !expression.trim()) {
    return { correct: false, explanation: 'Please construct an expression before submitting.' };
  }

  // 1. Extract numbers used in expression
  const numberTokens = (expression.match(/\d+/g) || []).map((n) => parseInt(n, 10));

  // Check count
  if (numberTokens.length !== puzzle.numbers.length) {
    return {
      correct: false,
      explanation: `You must use exactly ${puzzle.numbers.length} numbers. Used: ${numberTokens.length}.`,
    };
  }

  // Compare multiset of numbers
  const expectedSorted = [...puzzle.numbers].sort((a, b) => a - b);
  const actualSorted = [...numberTokens].sort((a, b) => a - b);
  const numbersMatch = expectedSorted.every((val, i) => val === actualSorted[i]);

  if (!numbersMatch) {
    return {
      correct: false,
      explanation: `You must use each given number [${puzzle.numbers.join(', ')}] exactly once.`,
    };
  }

  // 2. Parse & Evaluate Expression
  try {
    const parser = new ExpressionParser(expression);
    const fractionResult = parser.parse();
    const evaluatedVal = fractionResult.toNumber();

    if (fractionResult.equalsInt(puzzle.target) || Math.abs(evaluatedVal - puzzle.target) < 1e-7) {
      return {
        correct: true,
        explanation: `Brilliant! ${expression} = ${puzzle.target}.`,
        value: evaluatedVal,
      };
    } else {
      return {
        correct: false,
        explanation: `Expression evaluates to ${evaluatedVal.toFixed(2)}, not ${puzzle.target}.`,
        value: evaluatedVal,
      };
    }
  } catch (err: any) {
    return {
      correct: false,
      explanation: err.message || 'Syntax error in mathematical expression.',
    };
  }
}
