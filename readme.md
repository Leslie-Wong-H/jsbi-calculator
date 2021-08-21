# JSBI-Calculator

JSBI-Calculator is a calculator utility to perform arbitrary arithmetic computation, with the help of JSBI-based BigDecimal.

## Installation

```
> npm install jsbi-calculator
```

## Usage

> For module:

```js
import calculator from "jsbi-calculator";

const expressionOne = "((10 * (24 / ((9 + 3) * (-2)))) + 17) + 5";
const resultOne = calculator(expressionOne);
console.log(resultOne);
// -> '12'

const max = String(Number.MAX_SAFE_INTEGER);
console.log(max);
// -> '9007199254740991'
const expressionTwo = `${max} + 2`;
const resultTwo = calculator(expressionTwo);
console.log(resultTwo);
// -> '9007199254740993'
```

> For node:

```js
const calculator = require("jsbi-calculator").calculator;

const expressionOne = "((10 * (24 / ((9 + 3) * (-2)))) + 17) + 5";
const resultOne = calculator(expressionOne);
console.log(resultOne);
// -> '12'

const max = String(Number.MAX_SAFE_INTEGER);
console.log(max);
// -> '9007199254740991'
const expressionTwo = `${max} + 2`;
const resultTwo = calculator(expressionTwo);
console.log(resultTwo);
// -> '9007199254740993'
```

> For browser:

```js

```

## Note:

The following operations are available. Please mind the factors which are
negative must start with "-" and be surrounded by parentheses, and
positive ones can not start with "+".

| Operation      | Symbol |
| -------------- | ------ |
| Addition       | `+`    |
| Subtration     | `-`    |
| Multiplication | `*`    |
| Division       | `/`    |

## Under the hood:

