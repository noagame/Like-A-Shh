import type { Config } from "jest";

  const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/tests"],
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/$1",
    },
    collectCoverageFrom: [
      "lib/**/*.ts",
      "app/**/*.ts",
      "app/**/*.tsx",
    ],
  };

  export default config;