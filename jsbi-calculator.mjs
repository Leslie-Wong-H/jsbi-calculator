/*
 * @author Leslie Wong
 * @email 79917148leslie@gmail.com
 * @description a calculator utility to perform arbitrary-presion arithmetic in BigDecimal, JSBI based.
 */
"use strict";

import JSBI from "jsbi";

/**
 * Directly get the result with arbitrary precision using jsbiCal and rpnParse
 * @param {String} expression
 * @returns {String}
 */

function calculator(expression) {
  return jsbiCal(rnpParse(arrayizeExpression(expression)));
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
  var verified;
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
    var arrayizedExpression = expression.split("").reduce((acc = [], cur) => {
      var newCur = cur.trim();
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
          var checkArray = ["(", ")", "+", "-", "*", "/"];
          // in case of the negative nubmer (must be surrounded by parenthesis)
          if (
            acc.length >= 2 &&
            acc[acc.length - 1] === "-" &&
            acc[acc.length - 2] === "("
          ) {
            acc[acc.length - 1] += newCur;
          } else if (checkArray.indexOf(acc[acc.length - 1]) > -1 && newCur) {
            acc.push(newCur);
          } else {
            acc[acc.length - 1] += newCur;
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
        stack.push(JSBI.add(b1, a1));
        break;
      }
      case "-": {
        let a2 = stack.pop();
        let b2 = stack.pop();
        stack.push(JSBI.subtract(b2, a2));
        break;
      }
      case "*": {
        let a3 = stack.pop();
        let b3 = stack.pop();
        stack.push(JSBI.multiply(b3, a3));
        break;
      }
      case "/": {
        let a4 = stack.pop();
        let b4 = stack.pop();
        stack.push(JSBI.divide(b4, a4));
        break;
      }
      default:
        stack.push(JSBI.BigInt(item));
    }
  }
  return String(stack.pop());
}

/**
 * To generate RNP(Reverse Polish Notaion) using the shunting-yard algorithm
 *  reference: https://www.freecodecamp.org/news/parsing-math-expressions-with-javascript-7e8f5572276e/
 * @param {Array} inp
 * @returns {Array}
 */
function rnpParse(inp) {
  var outQueue = [];
  var opStack = [];
  var assoc = {
    "^": "right",
    "*": "left",
    "/": "left",
    "+": "left",
    "-": "left",
  };

  var prec = {
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

  // tokenize
  var tokens = tokenize(inp);

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
  var result = [];

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

export { calculator, arrayizeExpression, jsbiCal, rnpParse };
