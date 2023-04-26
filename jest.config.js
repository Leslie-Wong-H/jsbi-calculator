module.exports = {
  roots: ["<rootDir>/test"],
  testRegex: "test/(.+)\\.spec\\.(js?|ts?)$",
  transform: {
    "^.+\\.ts?$": ["ts-jest", { useESM: true }],
  },
  moduleFileExtensions: ["js", "ts"],
  extensionsToTreatAsEsm: [".ts"],
};
