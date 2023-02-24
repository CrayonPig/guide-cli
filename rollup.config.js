import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { cleandir } from 'rollup-plugin-cleandir';
import alias from '@rollup/plugin-alias';
import typescript from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: {
    dir: path.resolve(__dirname, './lib'),
    format: 'cjs',
    banner: '#!/usr/bin/env node'
  },
  plugins: [
    cleandir(path.resolve(__dirname, './lib')),
    // 配置别名的插件
    json(),
    alias({
      entries: [
        {
          find: '@', replacement: path.resolve(__dirname, './src')
        }
      ]
    }),
    typescript({
      module: 'esnext',
      exclude: ['./node_modules/**']
    }),
    // 查找和打包node_modules中的第三方模块
    resolve.default({
      extensions: ['.js', '.ts', '.json'],
      modulesOnly: true,
      preferredBuiltins: false,
      preferBuiltins: true
    }),
    commonjs({ extensions: ['.js', '.ts', '.json'] }),
    babel({
      babelHelpers: 'bundled',
      extensions: [
        '.ts',
        '.tsx'
      ]
    })
  ],
  external: Object.keys(pkg.dependencies)
};
