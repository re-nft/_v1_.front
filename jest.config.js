module.exports = {
  testEnvironment: "jsdom",
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    // https://jestjs.io/docs/webpack#mocking-css-modules
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",

    // Handle CSS imports (without CSS modules)
    "^.+\\.(css|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",

    // Handle image imports
    // https://jestjs.io/docs/webpack#handling-static-assets
    "^.+\\.(jpg|jpeg|png|gif|webp|svg)$": `<rootDir>/__mocks__/fileMock.js`,

    // Handle module aliases
    "^renft-front/components/(.*)$": "<rootDir>/src/components/$1",
    "^renft-front/pages/(.*)$": "<rootDir>/src/pages/$1",
    "^renft-front/consts$": "<rootDir>/src/consts",
    "^renft-front/utils$": "<rootDir>/src/utils/index",
    "^renft-front/utils/(.*)$": "<rootDir>/src/utils/$1",
    "^renft-front/types$": "<rootDir>/src/types/index",
    "^renft-front/types/(.*)$": "<rootDir>/src/types/$1",
    "^renft-front/services/(.*)$": "<rootDir>/src/services/$1",
    "^renft-front/hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^renft-front/contracts/(.*)$": "<rootDir>/src/contracts/$1",
    "^__mocks__/(.*)$": "<rootDir>/src/__mocks__/$1",
    "^__tests__/(.*)$": "<rootDir>/src/__tests__/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
};
