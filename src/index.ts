#!/usr/bin/env node
import importLocal from 'import-local';
import log from '@/utils/log';
import core from '@/core/index';

log.info('欢迎使用Guide-cli', '');

if (importLocal(__filename)) {
  // 加载依赖
  log.info('cli', '您正在使用本地依赖版本');
} else {
  // 当前项目运行
  core();
}
