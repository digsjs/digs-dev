'use strict';

module.exports = function wallabyConfig() {
  return {
    files: [
      'lib/**/*.js'
    ],
    tests: [
      {
        pattern: 'test/**/*.spec.js',
        instrument: true
      },
      {
        pattern: 'test/**/suites/*.js',
        instrument: false
      }
    ],
    env: {
      type: 'node'
    },
    testFramework: 'mocha',
    bootstrap: function bootstrap(wallaby) {
      var path = require('path');
      require(path.join(wallaby.localProjectDir, 'test', 'fixture'));
    }
  };
};
