# rollup-plugin-solidity
Converts solidity files to modules:

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