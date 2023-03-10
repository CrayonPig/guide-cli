import pkg from '../../package.json';

const LOWEST_NODE_VERSION = '12.0.0';
const PKG_NAME = Object.keys(pkg.bin)[0];
const NPM_PKG_NAME = pkg.name;
const PKG_VERSION = pkg.version;
const DEFAULT_CLI_HOME = `.${PKG_NAME}`;
const GIT_COMMIT_CONFIG: Array<{
  value: string;
  name: string;
  emoji: string;
}> = [
  {
    value: 'feat',
    name: 'feat:    🚀  新增功能',
    emoji: '🚀'
  },
  {
    value: 'fix',
    name: 'fix:      🧩  修复缺陷',
    emoji: '🧩'
  },
  {
    value: 'docs',
    name: 'docs:     📚  文档变更',
    emoji: '📚'
  },
  {
    value: 'style',
    name: 'style:    🎨  代码格式（不影响功能，例如空格、分号等格式修正）',
    emoji: '🎨'
  },
  {
    value: 'refactor',
    name: 'refactor:  ♻️   代码重构（不包括 bug 修复、功能新增）',
    emoji: '♻️'
  },
  {
    value: 'perf',
    name: 'perf:     ⚡️  性能优化',
    emoji: '⚡️'
  },
  {
    value: 'test',
    name: 'test:     ✅  添加疏漏测试或已有测试改动',
    emoji: '✅'
  },
  {
    value: 'build',
    name: 'build:    📦️  构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）',
    emoji: '📦️'
  },
  {
    value: 'ci',
    name: 'ci:       🎡  修改 CI 配置、脚本',
    emoji: '🎡'
  },
  {
    value: 'revert',
    name: 'revert:   ⏪️  回滚 commit',
    emoji: '⏪️'
  }
];

export {
  LOWEST_NODE_VERSION,
  DEFAULT_CLI_HOME,
  PKG_NAME,
  PKG_VERSION,
  NPM_PKG_NAME,
  GIT_COMMIT_CONFIG
};
