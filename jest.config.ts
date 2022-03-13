import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: './',
    modulePaths: ['<rootDir>'],
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest'
    },
    collectCoverageFrom: [
        '<rootDir>/src/**/*.(controller|service|strategy|listener).(t|j)s'
    ],
    coverageDirectory: '../coverage',
    coveragePathIgnorePatterns: [
        './node_modules/',
        './dist/',
        '<rootDir>/src/shared',
        '<rootDir>/src/config'
    ],
    testEnvironment: 'node'
};

export default config;
