import semver from 'semver';
import colors from 'colors';
import userHome from 'user-home';
import pathExists from 'path-exists';
import log from '../utils/log';
import { LOWEST_NODE_VERSION, NPM_PKG_NAME, PKG_VERSION } from '@/utils/const';
import { getNpmSemverVersion } from '@/utils/npm-info';
import registerCommand from './registerCommand';

async function checkGlobalUpdate() {
  // 检查是否需要全局更新
  const lastVersions = await getNpmSemverVersion(PKG_VERSION, NPM_PKG_NAME);

  if (lastVersions && semver.gte(lastVersions, PKG_VERSION)) {
    log.warn('更新提示', colors.yellow(`请手动更新 ${NPM_PKG_NAME}, 当前版本: ${PKG_VERSION}, 最新版本: ${lastVersions}\n更新命令：npm install -g ${NPM_PKG_NAME}`));
  }
}

function checkUserHome() {
  // 检查用户目录
  log.verbose('userHome', userHome);
  if (!userHome || !pathExists.sync(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在'));
  }
}

function checkRoot() {
  // root用户降权
  import('root-check').then(({ default: rootCheck }) => {
    rootCheck();
  });
}

function checkNodeVersion() {
  // 检测node版本
  // 1、 获取当前node版本号
  const currentVersion = process.version;
  const lowestVersion = LOWEST_NODE_VERSION;
  // 2、 对比最低版本号
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`需要安装 v${lowestVersion} 以上版本的 Node.js`));
  }
}

async function prepare() {
  checkNodeVersion();
  checkRoot();
  checkUserHome();
  await checkGlobalUpdate();
}

async function core() {
  try {
    await prepare();
    registerCommand();
  } catch (error) {
    log.error('error', (error as Error).message);
  }
}

export default core;
