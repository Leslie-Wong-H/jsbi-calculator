/*
 * @author Leslie Wong
 * @email 79917148leslie@gmail.com
 * @description a calculator utility to perform arbitrary-precision arithmetic in BigDecimal, JSBI based.
 */

"use strict";

import JSBI from "jsbi";

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
if (!String.prototype.repeat) {
  String.prototype.repeat = function (count) {
    "use strict";
    if (this == null) {
      throw new TypeError("can't convert " + this + " to object");
    }
    var str = "" + this;
    count = +count;
    if (count != count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError("repeat count must be non-negative");
    }
    if (count == Infinity) {
      throw new RangeError("repeat count must be less than infinity");
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
      return "";
    }
    if (str.length * count >= 1 << 28) {
      throw new RangeError(
        "repeat count must not overflow maximum string size"
      );
    }
    var rpt = "";
    for (;;) {
      if ((count & 1) == 1) {
        rpt += str;
      }
      count >>>= 1;
      if (count == 0) {
        break;
      }
      str += str;
    }
    return rpt;
  };
}
if (!String.prototype.padStart) {
  String.prototype.padStart = function (targetLength, padString) {
    targetLength = targetLength >> 0;
    padString = String(typeof padString !== "undefined" ? padString : " ");
    if (this.length > targetLength || padString === "") {
      return String(this);
    }
    targetLength = targetLength - this.length;
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length);
    }
    return padString.slice(0, targetLength) + String(this);
  };
}
if (!String.prototype.padEnd) {
  String.prototype.padEnd = function (targetLength, padString) {
    targetLength = targetLength >> 0;
    padString = String(typeof padString !== "undefined" ? padString : " ");
    if (this.length > targetLength || padString === "") {
      return String(this);
    }
    targetLength = targetLength - this.length;
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length);
    }
    return String(this) + padString.slice(0, targetLength);
  };
}

/**
 *
 * @description A custom BigDecimal class wrapped with JSBI,
 * inspired from trincot's answer.
 * https://stackoverflow.com/a/66939244/8808175
 *
 */
class BigDecimal {
  // Configuration: constants
  static DECIMALS = 18; // number of decimals on all instances
  static ROUNDED = true; // number are truncated (false) or rounded (true)
  static SHIFT = JSBI.BigInt("1" + "0".repeat(BigDecimal.DECIMALS)); // derived constant
  private _n: JSBI;
  constructor(value: BigDecimal | string) {
    this._n = JSBI.BigInt(0);
    if (value instanceof BigDecimal) return value;
    let [ints, decis] = String(value).split(".").concat("");
    this._n = JSBI.add(
      JSBI.BigInt(
        ints +
          decis.padEnd(BigDecimal.DECIMALS, "0").slice(0, BigDecimal.DECIMALS)
      ),
      JSBI.BigInt(BigDecimal.ROUNDED && decis[BigDecimal.DECIMALS] >= "5")
    );
  }

  static fromJSBIBigInt(jsbibigint: JSBI): BigDecimal {
    return Object.assign(Object.create(BigDecimal.prototype), {
      _n: jsbibigint,
    });
  }
  add(num: BigDecimal | string): BigDecimal {
    return BigDecimal.fromJSBIBigInt(JSBI.add(this._n, new BigDecimal(num)._n));
  }
  subtract(num: BigDecimal | string): BigDecimal {
    return BigDecimal.fromJSBIBigInt(
      JSBI.subtract(this._n, new BigDecimal(num)._n)
    );
  }
  static _divRound(dividend: JSBI, divisor: JSBI): BigDecimal {
    return BigDecimal.fromJSBIBigInt(
      JSBI.add(
        JSBI.divide(dividend, divisor),
        BigDecimal.ROUNDED
          ? JSBI.remainder(
              JSBI.divide(JSBI.multiply(dividend, JSBI.BigInt(2)), divisor),
              JSBI.BigInt(2)
            )
          : JSBI.BigInt(0)
      )
    );
  }
  multiply(num: BigDecimal | string): BigDecimal {
    return BigDecimal._divRound(
      JSBI.multiply(this._n, new BigDecimal(num)._n),
      BigDecimal.SHIFT
    );
  }
  divide(num: BigDecimal | string): BigDecimal {
    return BigDecimal._divRound(
      JSBI.multiply(this._n, BigDecimal.SHIFT),
      new BigDecimal(num)._n
    );
  }
  toString(): string {
    const s = this._n.toString().padStart(BigDecimal.DECIMALS + 1, "0");
    let r =
      s.slice(0, -BigDecimal.DECIMALS) +
      "." +
      s.slice(-BigDecimal.DECIMALS).replace(/\.?0+$/, "");
    return r.slice(-1) === "." ? r.slice(0, -1) : r;
  }
}

/**
 * Directly get the result with arbitrary precision using jsbiCal and rpnParse
 * @param {String} expression
 * @returns {String}
 */

function calculator(expression: string): string {
  return jsbiCal(rpnParse(arrayizeExpression(expression)));
}

/**
 * Transform the math expression string to array form, arithmetic only. The factors which are negative must start with "-"
 * and be surrounded by parentheses, and positive ones can not start with "+".
 *
 * operators:
 *
 * "+" - addition
 *
 * "-" - subtraction
 *
 * "*" - multiplication
 *
 * "/" - division
 *
 * @param {String} expression
 * @returns {Array} arrayizedExpression
 */
function arrayizeExpression(expression: string): string[] {
  // verify the accuracy of expression first
  let verified;
  try {
    let verify = new Function("return (" + expression + ") || 0");
    verify();
    verified = true;
  } catch (e) {
    verified = false;
    throw new Error("The expression is not accurate");
  }
  if (verified) {
    const checkArray = ["(", ")", "+", "-", "*", "/"];
    let arrayizedExpression = expression
      .split("")
      .reduce((acc: string[] = [], cur) => {
        const newCur: string = cur.trim();
        switch (newCur) {
          case "(":
          case ")":
          case "+":
          case "-":
          case "*":
          case "/":
            acc.push(newCur);
            break;

          default:
            // in case of the negative nubmer (must be surrounded by parenthesis)
            if (
              acc.length >= 2 &&
              acc[acc.length - 1] === "-" &&
              acc[acc.length - 2] === "("
            ) {
              acc[acc.length - 1] += newCur;
              // newCur(digit) next to symbols
            } else if (checkArray.indexOf(acc[acc.length - 1]) > -1 && newCur) {
              acc.push(newCur);
              // newCur(digit) next to digit
            } else if (acc.length !== 0 && acc[acc.length - 1]) {
              acc[acc.length - 1] += newCur;
              // newCur(digit) in the front of the expression
            } else {
              acc.push(newCur);
            }
        }
        return acc;
      }, []);
    return arrayizedExpression;
  } else {
    return [];
  }
}

/**
 * Calculate the result of reverse-polish-notation
 * Reference: https://leetcode.com/problems/evaluate-reverse-polish-notation/
 * @param {Array} tokens
 * @returns
 */
function jsbiCal(tokens: string[]): string {
  // declare stack
  let stack: BigDecimal[] = [];
  tokens.forEach((item) => {
    switch (item) {
      case "+": {
        let a1 = stack.pop();
        let b1 = stack.pop();
        a1 && b1 && stack.push(new BigDecimal(b1).add(a1));
        break;
      }
      case "-": {
        let a2 = stack.pop();
        let b2 = stack.pop();
        a2 && b2 && stack.push(new BigDecimal(b2).subtract(a2));
        break;
      }
      case "*": {
        let a3 = stack.pop();
        let b3 = stack.pop();
        a3 && b3 && stack.push(new BigDecimal(b3).multiply(a3));
        break;
      }
      case "/": {
        let a4 = stack.pop();
        let b4 = stack.pop();
        a4 && b4 && stack.push(new BigDecimal(b4).divide(a4));
        break;
      }
      default:
        stack.push(new BigDecimal(item));
    }
  });
  return String(stack.pop());
}

/**
 * To generate rpn(Reverse Polish Notaion) using the shunting-yard algorithm
 *  reference: https://www.freecodecamp.org/news/parsing-math-expressions-with-javascript-7e8f5572276e/
 * @param {Array} inp
 * @returns {Array}
 */
function rpnParse(inp: string[]): string[] {
  let outQueue: Token[] = [];
  let opStack: Token[] = [];

  // tokenize
  const tokens = tokenize(inp);

  if (Array.isArray(tokens)) {
    tokens.forEach(function (t: Token) {
      if (isDigit(t.value) || isLetter(t.value)) {
        outQueue.push(t);
      } else if (isOperator(t.value)) {
        while (
          opStack.length > 0 &&
          t.associativity &&
          t.precedence &&
          ((t.associativity() === "left" &&
            t.precedence() <= peak(opStack).precedence()) ||
            (t.associativity() === "right" &&
              t.precedence() < peak(opStack).precedence()) ||
            t.type === "Left Parenthesis")
        ) {
          outQueue.push(opStack.pop() as Token);
        }
        opStack.push(t);
      } else if (isLeftParenthesis(t.value)) {
        opStack.push(t);
      } else if (isRightParenthesis(t.value)) {
        while (opStack.length > 0 && peak(opStack).type === "Operator") {
          outQueue.push(opStack.pop() as Token);
        }
        if (opStack.length > 0 && peak(opStack).type === "Left Parenthesis") {
          opStack.pop();
        }
      }
    });
  }

  // list of tokens in RPN
  return outQueue.concat(opStack.reverse()).map((el) => el.value);
}

function peak(Arr: any[]): any | undefined {
  if (Array.isArray(Arr) && Arr.length > 0) {
    return Arr.slice(-1)[0];
  } else {
    return undefined;
  }
}

interface Token {
  type: string;
  value: "^" | "*" | "/" | "+" | "-";
  associativity?: () => "left" | "right";
  precedence?: () => 2 | 3 | 4;
}

interface Assoc {
  "^": "right";
  "*": "left";
  "/": "left";
  "+": "left";
  "-": "left";
}

interface Prec {
  "^": 4;
  "*": 3;
  "/": 3;
  "+": 2;
  "-": 2;
}

function tokenize(expArr: string[]): Token[] {
  let result: Token[] = [];

  const assoc: Assoc = {
    "^": "right",
    "*": "left",
    "/": "left",
    "+": "left",
    "-": "left",
  };

  const prec: Prec = {
    "^": 4,
    "*": 3,
    "/": 3,
    "+": 2,
    "-": 2,
  };

  const Token = function (this: Token, type: string, value: Token["value"]) {
    this.type = type;
    this.value = value;
  };

  Token.prototype.precedence = function (this: Token): 2 | 3 | 4 {
    return prec[this.value];
  };

  Token.prototype.associativity = function (this: Token): "left" | "right" {
    return assoc[this.value];
  };

  // array of tokens
  if (Array.isArray(expArr)) {
    expArr.forEach(function (char, idx) {
      if (isDigit(char)) {
        result.push(new (Token as any)("Literal", char));
      } else if (isLetter(char)) {
        result.push(new (Token as any)("Variable", char));
      } else if (isOperator(char)) {
        result.push(new (Token as any)("Operator", char));
      } else if (isLeftParenthesis(char)) {
        result.push(new (Token as any)("Left Parenthesis", char));
      } else if (isRightParenthesis(char)) {
        result.push(new (Token as any)("Right Parenthesis", char));
      } else if (isComma(char)) {
        result.push(new (Token as any)("Function Argument Seperator", char));
      }
    });
  }
  return result;
}

function isComma(ch: string): boolean {
  return ch === ",";
}

function isDigit(ch: string): boolean {
  return /\d/.test(ch);
}

function isLetter(ch: string): boolean {
  return /[a-z]/i.test(ch);
}

function isOperator(ch: string): boolean {
  return /\+|-|\*|\/|\^/.test(ch);
}

function isLeftParenthesis(ch: string): boolean {
  return ch === "(";
}

function isRightParenthesis(ch: string): boolean {
  return ch === ")";
}

const JBC = {
  calculator,
  arrayizeExpression,
  jsbiCal,
  rpnParse,
};

export default JBC;
