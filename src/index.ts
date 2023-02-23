#!/usr/bin/env node
import importLocal from 'import-local';
import log from '@/utils/log';

log.info('header', 'hello guide cli11145226');

if (importLocal(__filename)) {
  // 加载依赖
  log.info('cli', '您正在使用依赖版本');
} else {
  // 当前项目运行
  import('@/core/index').then(({ default: core }) => {
    core();
  });
}
