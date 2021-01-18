import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from 'rollup-plugin-json';
import {terser} from 'rollup-plugin-terser';
import analyze from 'rollup-plugin-analyzer'

export default [
  {
    input: 'lib/node.js',
    output: {
      format: 'cjs',
      file: 'dist/weddell.node.cjs.js'
    },
    plugins: [resolve(), commonjs(), json(), terser()],
    // indicate which modules should be treated as external
    external: []
  },
  {
    input: 'lib/node.js',
    output: {
      format: 'esm',
      file: 'dist/weddell.node.esm.js'
    },
    plugins: [resolve(), commonjs(), json(), terser(), analyze()],
    // indicate which modules should be treated as external
    external: []
  }
];