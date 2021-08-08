import { assert } from "chai";
import { calculator, arrayizeExpression } from "../jsbi-calculator.mjs";

var expression = "((10 * (24 / ((9 + 3) * (-2)))) + 17) + 5";

assert.typeOf(expression, "string", "The variable expression is a string");
assert.lengthOf(
  arrayizeExpression(expression),
  25,
  "The tokenized expression has a length of 25"
);
assert.equal(
  calculator(expression),
  "12",
  "The result of expression equals to 12"
);
