# JSBI-Calculator

[![License](https://img.shields.io/github/license/Leslie-Wong-H/jsbi-calculator.svg?style=flat-square)](https://github.com/Leslie-Wong-H/jsbi-calculator/blob/master/LICENSE)
[![Coverage](https://img.shields.io/codecov/c/github/Leslie-Wong-H/jsbi-calculator/main.svg?style=flat)](https://app.codecov.io/gh/Leslie-Wong-H/jsbi-calculator/branch/main)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/Leslie-Wong-H/jsbi-calculator/main.yml?branch=main&style=flat-square)](https://github.com/Leslie-Wong-H/jsbi-calculator/actions)
[![GitHub release](https://img.shields.io/github/release/Leslie-Wong-H/jsbi-calculator.svg)](https://github.com/Leslie-Wong-H/jsbi-calculator/releases/latest)
[![NPM](https://img.shields.io/npm/dw/jsbi-calculator)](https://www.npmjs.com/package/jsbi-calculator)

JSBI-Calculator是一个IE11兼容的计算器JS库组件，用于实现高精度（至多18位小数）大数值四则运算，基于由谷歌Chrome实验室出品的JSBI封装的BigDecimal。

该项目反哺[GoogleChromeLabs/jsbi](https://github.com/GoogleChromeLabs/jsbi/issues/79)作出了不凡贡献。

## 安装

```
> npm install jsbi-calculator
```

## 示例

![Showcase](https://i.loli.net/2021/12/03/aADG5LxcZ2fh1vS.png)

## 用法

> ES6模块:

```js
import JBC from "jsbi-calculator";

const { calculator } = JBC;

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

> Node CommonJS模块:

```js
const JBC = require("jsbi-calculator");

const { calculator } = JBC;

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

> 浏览器:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jsbi-calculator Test</title>
    <script src="https://cdn.jsdelivr.net/npm/jsbi-calculator/dist/jsbi-calculator-umd.js"></script>
  </head>
  <body></body>
  <script type="text/javascript">
    const expressionOne = "((10 * (24 / ((9 + 3) * (-2)))) + 17) + 5";
    const resultOne = JBC.calculator(expressionOne);
    console.log(resultOne);
    // -> '12'

    const userAgent = navigator.userAgent;
    const isIE11 =
      userAgent.indexOf("Trident") > -1 && userAgent.indexOf("rv:11.0") > -1;
    let max;
    // MAX_SAFE_INTEGER not available in IE11
    max = isIE11 ? "9007199254740991" : String(Number.MAX_SAFE_INTEGER);

    console.log(max);
    // -> '9007199254740991'
    const expressionTwo = max + " + 2";
    const resultTwo = JBC.calculator(expressionTwo);
    console.log(resultTwo);
    // -> '9007199254740993'
  </script>
</html>
```

## 注意

下面表格中的运算操作是有涉及到的。请注意，负数需要以`-`开头且需要用括号括起来，例如`(-11)`,正数不能以`+`号开头。

| 运算操作 | 运算符号                            |
| -------- | ----------------------------------- |
| 加法     | `+`                                 |
| 减法     | `-`                                 |
| 乘法     | `*`                                 |
| 除法     | `/`                                 |
| 平方根   | JBC.BigDecimal.sqrt(num).toString() |

## 致谢

项目开发得到了下列资源的灵感启发。

[GoogleChromeLabs/jsbi](https://github.com/GoogleChromeLabs/jsbi)

[trincot's answer to _BigDecimal in JavaScript_](https://stackoverflow.com/a/66939244/8808175)

[LeetCode150 - Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/)

[Parsing math expressions with JavaScript - FreeCodeCamp](https://www.freecodecamp.org/news/parsing-math-expressions-with-javascript-7e8f5572276e/)

## [苍穹之下](https://github.com/Leslie-Wong-H/jsbi-calculator/blob/main/src/jsbi-calculator.ts)
