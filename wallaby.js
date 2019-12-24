require('dotenv').config({ path: '.env' });

module.exports = wallaby => ({
  files: ['src/**/*.js', '!src/**/__tests__/**.js'],
  tests: ['src/**/__tests__/**.js'],
  env: {
    type: 'node',
  },
  testFramework: 'jest',
  compilers: {
    '**/*.js': wallaby.compilers.babel(),
  },
});
