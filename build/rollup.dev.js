import path from 'path';
import { babel } from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import { cleandir } from 'rollup-plugin-cleandir';
import alias from '@rollup/plugin-alias';
import typescript from 'rollup-plugin-typescript2';
import { DEFAULT_EXTENSIONS } from '@babel/core';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    banner: '#!/usr/bin/env node'
  },
  plugins: [
    cleandir(path.resolve(__dirname, '../', 'dist')),
    // 配置别名的插件
    alias({
      entries: [
        {
          find: '@', replacement: path.resolve(__dirname, '../src')
        }
      ]
    }),
    // 查找和打包node_modules中的第三方模块
    nodeResolve({
      extensions: ['.js', '.ts'],
      preferBuiltins: true
    }),
    typescript(),
    replace({
      preventAssignment: true
    }),
    commonjs({
      ignoreDynamicRequires: true,
      defaultIsModuleExports: true
    }),
    babel({
      babelHelpers: 'bundled',
      extensions: [
        ...DEFAULT_EXTENSIONS,
        '.ts',
        '.tsx'
      ]
    }),
    json(),
    eslint({
      include: ['src/**'],
      exclude: ['node_modules/**']
    })
  ]
};
