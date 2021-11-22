/*
 * @author Leslie Wong
 * @email 79917148leslie@gmail.com
 * @description a calculator utility to perform arbitrary-precision arithmetic in BigDecimal, JSBI based.
 */

"use strict";

import JSBI from "jsbi";

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
  static SHIFT = JSBI.BigInt(
    "1" +
      String(
        ["0"].map((e) => {
          let result = "";
          for (let i = 0; i < BigDecimal.DECIMALS; i++) {
            result += e;
          }
          return result;
        })
      )
  ); // derived constant
  constructor(value) {
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

  static fromJSBIBigInt(jsbibigint) {
    return Object.assign(Object.create(BigDecimal.prototype), {
      _n: jsbibigint,
    });
  }
  add(num) {
    return BigDecimal.fromJSBIBigInt(JSBI.add(this._n, new BigDecimal(num)._n));
  }
  subtract(num) {
    return BigDecimal.fromJSBIBigInt(
      JSBI.subtract(this._n, new BigDecimal(num)._n)
    );
  }
  static _divRound(dividend, divisor) {
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
  multiply(num) {
    return BigDecimal._divRound(
      JSBI.multiply(this._n, new BigDecimal(num)._n),
      BigDecimal.SHIFT
    );
  }
  divide(num) {
    return BigDecimal._divRound(
      JSBI.multiply(this._n, BigDecimal.SHIFT),
      new BigDecimal(num)._n
    );
  }
  toString() {
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

function calculator(expression) {
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
function arrayizeExpression(expression) {
  // verify the accuracy of expression first
  let verified;
  try {
    let verify = new Function("return (" + expression + ") || 0");
    verify();
    verified = true;
  } catch (e) {
    console.log("The expression is not accurate");
    verified = false;
    return [];
  }
  if (verified) {
    const checkArray = ["(", ")", "+", "-", "*", "/"];
    let arrayizedExpression = expression.split("").reduce((acc = [], cur) => {
      const newCur = cur.trim();
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
  }
}

/**
 * Calculate the result of reverse-polish-notation
 * Reference: https://leetcode.com/problems/evaluate-reverse-polish-notation/
 * @param {Array} tokens
 * @returns
 */
function jsbiCal(tokens) {
  // declare stack
  let stack = [];
  for (let item of tokens) {
    switch (item) {
      case "+": {
        let a1 = stack.pop();
        let b1 = stack.pop();
        stack.push(new BigDecimal(b1).add(a1));
        break;
      }
      case "-": {
        let a2 = stack.pop();
        let b2 = stack.pop();
        stack.push(new BigDecimal(b2).subtract(a2));
        break;
      }
      case "*": {
        let a3 = stack.pop();
        let b3 = stack.pop();
        let b3_ = stack.push(new BigDecimal(b3).multiply(a3));
        break;
      }
      case "/": {
        let a4 = stack.pop();
        let b4 = stack.pop();
        stack.push(new BigDecimal(b4).divide(a4));
        break;
      }
      default:
        stack.push(new BigDecimal(item));
    }
  }
  return String(stack.pop());
}

/**
 * To generate rpn(Reverse Polish Notaion) using the shunting-yard algorithm
 *  reference: https://www.freecodecamp.org/news/parsing-math-expressions-with-javascript-7e8f5572276e/
 * @param {Array} inp
 * @returns {Array}
 */
function rpnParse(inp) {
  let outQueue = [];
  let opStack = [];

  // tokenize
  const tokens = tokenize(inp);

  if (Array.isArray(tokens)) {
    tokens.forEach(function (t) {
      if (isDigit(t.value) || isLetter(t.value)) {
        outQueue.push(t);
      } else if (isOperator(t.value)) {
        while (
          opStack.length > 0 &&
          ((t.associativity() === "left" &&
            t.precedence() <= peak(opStack).precedence()) ||
            (t.associativity() === "right" &&
              t.precedence() < peak(opStack).precedence()) ||
            t.type === "Left Parenthesis")
        ) {
          outQueue.push(opStack.pop());
        }
        opStack.push(t);
      } else if (isLeftParenthesis(t.value)) {
        opStack.push(t);
      } else if (isRightParenthesis(t.value)) {
        while (opStack.length > 0 && peak(opStack).type === "Operator") {
          outQueue.push(opStack.pop());
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

function peak(Arr) {
  if (Array.isArray(Arr) && Arr.length > 0) {
    return Arr.slice(-1)[0];
  } else {
    return undefined;
  }
}

function tokenize(expArr) {
  let result = [];

  const assoc = {
    "^": "right",
    "*": "left",
    "/": "left",
    "+": "left",
    "-": "left",
  };

  const prec = {
    "^": 4,
    "*": 3,
    "/": 3,
    "+": 2,
    "-": 2,
  };

  Token.prototype.precedence = function () {
    return prec[this.value];
  };

  Token.prototype.associativity = function () {
    return assoc[this.value];
  };

  // array of tokens
  if (Array.isArray(expArr)) {
    expArr.forEach(function (char, idx) {
      if (isDigit(char)) {
        result.push(new Token("Literal", char));
      } else if (isLetter(char)) {
        result.push(new Token("Variable", char));
      } else if (isOperator(char)) {
        result.push(new Token("Operator", char));
      } else if (isLeftParenthesis(char)) {
        result.push(new Token("Left Parenthesis", char));
      } else if (isRightParenthesis(char)) {
        result.push(new Token("Right Parenthesis", char));
      } else if (isComma(char)) {
        result.push(new Token("Function Argument Seperator", char));
      }
    });
  }
  return result;
}

function Token(type, value) {
  this.type = type;
  this.value = value;
}

function isComma(ch) {
  return ch === ",";
}

function isDigit(ch) {
  return /\d/.test(ch);
}

function isLetter(ch) {
  return /[a-z]/i.test(ch);
}

function isOperator(ch) {
  return /\+|-|\*|\/|\^/.test(ch);
}

function isLeftParenthesis(ch) {
  return ch === "(";
}

function isRightParenthesis(ch) {
  return ch === ")";
}

const JBC = {
  calculator,
  arrayizeExpression,
  jsbiCal,
  rpnParse,
};

export default JBC;
