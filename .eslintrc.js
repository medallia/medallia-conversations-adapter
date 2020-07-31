module.exports = {
  "root": true,
  "extends": ["airbnb-base"],
  "plugins": [
    "jest",
  ],
  "rules": {
    "camelcase": ["error", {"properties": "never"}],
    "comma-dangle": ["error", "only-multiline"],
    "function-paren-newline": "off",
    "implicit-arrow-linebreak": "off",
    "indent": "warn",
    "max-len": ["error", 130],
    "no-console": "off",
    "no-underscore-dangle": "off",
    "object-curly-newline": "off",
    "prefer-destructuring": "off",
  },
  "globals": {
    "logger": true,
  },
  "env": {
    "node": true,
    "jest/globals": true,
  },
};
