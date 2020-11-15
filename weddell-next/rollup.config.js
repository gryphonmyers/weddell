import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default {
  input: 'index.js',
  output: {
    format: 'cjs'
  },
  plugins: [commonjs(), json()
    // resolve({
    //   // pass custom options to the resolve plugin
    //   customResolveOptions: {
    //     moduleDirectory: 'node_modules'
    //   }
    // })
  ],
  // indicate which modules should be treated as external
  external: []
};