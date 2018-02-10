# rollup-plugin-solidity [![npm version](https://badge.fury.io/js/rollup-plugin-solidity.svg)](https://badge.fury.io/js/rollup-plugin-solidity)[![Build Status](https://travis-ci.org/hrntknr/rollup-plugin-solidity.svg?branch=master)](https://travis-ci.org/hrntknr/rollup-plugin-solidity)
Converts solidity files to modules

## Installation
```sh
npm install --save-dev rollup-plugin-solidity
```

## Usage
```js
import {rollup} from 'rollup';
import solidity from 'rollup-plugin-solidity';

rollup({
  entry: 'main.js',
  plugins: [
    solidity()
  ]
});
```