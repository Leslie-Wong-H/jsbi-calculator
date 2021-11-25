module.exports = {
  presets: [
    [
      "@babel/env",
      {
        modules: false,
      },
    ],
  ],
  plugins: [
    [
      "module-resolver",
      {
        alias: {
          JSBI: "node_modules/jsbi",
        },
      },
    ],
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-object-assign",
  ],
};
