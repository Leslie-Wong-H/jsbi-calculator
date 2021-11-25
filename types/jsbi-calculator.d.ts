export default interface JBC {
  calculator: (expression: string) => string;
  arrayizeExpression: (expression: string) => string[];
  jsbiCal: (tokens: string[]) => string;
  rpnParse: (inp: string[]) => string[];
}
