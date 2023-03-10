#!/usr/bin/env node
'use strict';

var importLocal = require('import-local');
var log = require('npmlog');
var semver = require('semver');
var colors = require('colors');
var userHome = require('user-home');
var pathExists = require('path-exists');
var urlJoin = require('url-join');
var axios = require('axios');
var commander = require('commander');
var inquirer = require('inquirer');
var fse = require('fs-extra');
var shell = require('shelljs');
var simpleGit = require('simple-git');
var ora = require('ora');
var fs = require('fs');

var name = "guide-cli";
var version = "0.0.1";
var description = "";
var main = "bin/index.js";
var bin = {
	"guide-cli": "bin/index.js"
};
var files = [
	"./lib",
	"./bin"
];
var scripts = {
	dev: "rollup -w -c --bundleConfigAsCjs",
	build: "rollup --config ./build/rollup.dev.js --bundleConfigAsCjs",
	eslint: "eslint src --ext .ts"
};
var keywords = [
];
var author = "";
var license = "ISC";
var devDependencies = {
	"@babel/core": "^7.21.0",
	"@babel/preset-env": "^7.20.2",
	"@babel/preset-typescript": "^7.21.0",
	"@rollup/plugin-alias": "^4.0.3",
	"@rollup/plugin-babel": "^6.0.3",
	"@rollup/plugin-commonjs": "^24.0.1",
	"@rollup/plugin-eslint": "^9.0.3",
	"@rollup/plugin-json": "^6.0.0",
	"@rollup/plugin-node-resolve": "^15.0.1",
	"@types/colors": "^1.2.1",
	"@types/fs-extra": "^11.0.1",
	"@types/import-local": "^3.1.0",
	"@types/inquirer": "^8.2.0",
	"@types/node": "^18.13.0",
	"@types/npmlog": "^4.1.4",
	"@types/root-check": "^1.0.0",
	"@types/semver": "^7.3.13",
	"@types/shelljs": "^0.8.11",
	"@types/url-join": "^4.0.1",
	"@types/user-home": "^2.0.0",
	eslint: "^8.34.0",
	"eslint-plugin-guide": "^0.0.3",
	rollup: "^3.17.2",
	"rollup-plugin-cleandir": "^2.0.0",
	"rollup-plugin-typescript2": "^0.34.1",
	typescript: "^4.9.5"
};
var dependencies = {
	axios: "^1.3.4",
	colors: "^1.4.0",
	commander: "^10.0.0",
	"fs-extra": "^11.1.0",
	"import-local": "^3.1.0",
	inquirer: "^8.2.0",
	npmlog: "^7.0.1",
	ora: "^6.1.2",
	"path-exists": "^4.0.0",
	"root-check": "^2.0.0",
	semver: "^7.3.8",
	shelljs: "^0.8.5",
	"simple-git": "^3.17.0",
	"url-join": "^4.0.1",
	"user-home": "^3.0.0"
};
var pkg = {
	name: name,
	version: version,
	description: description,
	main: main,
	bin: bin,
	files: files,
	scripts: scripts,
	keywords: keywords,
	author: author,
	license: license,
	devDependencies: devDependencies,
	dependencies: dependencies
};

const LOWEST_NODE_VERSION = '12.0.0';
const PKG_NAME = Object.keys(pkg.bin)[0];
const NPM_PKG_NAME = pkg.name;
const PKG_VERSION = pkg.version;
const GIT_COMMIT_CONFIG = [{
  value: 'feat',
  name: 'feat:    🚀  新增功能',
  emoji: '🚀'
}, {
  value: 'fix',
  name: 'fix:      🧩  修复缺陷',
  emoji: '🧩'
}, {
  value: 'docs',
  name: 'docs:     📚  文档变更',
  emoji: '📚'
}, {
  value: 'style',
  name: 'style:    🎨  代码格式（不影响功能，例如空格、分号等格式修正）',
  emoji: '🎨'
}, {
  value: 'refactor',
  name: 'refactor:  ♻️   代码重构（不包括 bug 修复、功能新增）',
  emoji: '♻️'
}, {
  value: 'perf',
  name: 'perf:     ⚡️  性能优化',
  emoji: '⚡️'
}, {
  value: 'test',
  name: 'test:     ✅  添加疏漏测试或已有测试改动',
  emoji: '✅'
}, {
  value: 'build',
  name: 'build:    📦️  构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等）',
  emoji: '📦️'
}, {
  value: 'ci',
  name: 'ci:       🎡  修改 CI 配置、脚本',
  emoji: '🎡'
}, {
  value: 'revert',
  name: 'revert:   ⏪️  回滚 commit',
  emoji: '⏪️'
}];

log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'; // 判断debug模式
log.heading = PKG_NAME; // 修改前缀
log.headingStyle = {
  fg: 'green',
  bg: 'black'
};
log.addLevel('success', 2000, {
  fg: 'green',
  bold: true
}); // 添加自定义命令

function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.com' : 'https://registry.npmmirror.com';
}
function getNpmInfo(npmName, registry) {
  // 获取npm包详情
  if (!npmName) {
    return null;
  }
  const npmRegistry = registry || getDefaultRegistry();
  const npmInfoUrl = urlJoin(npmRegistry, npmName);
  return axios.get(npmInfoUrl).then(res => {
    if (res.status === 200) {
      return res.data;
    }
    return null;
  }).catch(err => Promise.reject(err));
}
async function getNpmVersion(npmName, registry) {
  // 获取npm包版本
  const res = await getNpmInfo(npmName, registry);
  if (res) {
    return Object.keys(res.versions);
  }
  return [];
}
function getSemverVersions(baseVersion, versions) {
  // 获取大于当前版本号, 并倒序排列
  const newVersions = versions.filter(version => semver.satisfies(version, `>${baseVersion}`)).sort((a, b) => semver.gt(b, a) ? 1 : -1);
  return newVersions;
}
async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersion(npmName, registry);
  const newVersions = getSemverVersions(baseVersion, versions);
  if (newVersions && newVersions.length) {
    return newVersions[0];
  }
  return null;
}

class Command {
  argv = [];
  cmd = {};
  constructor(argv) {
    if (!argv) {
      throw new Error('参数不能为空！');
    }
    if (!Array.isArray(argv)) {
      throw new Error('参数必须为数组！');
    }
    if (argv.length < 1) {
      throw new Error('参数列表为空！');
    }
    this.argv = argv;
    let chain = Promise.resolve();
    chain = chain.then(() => this.initArgs());
    chain = chain.then(() => this.init());
    chain = chain.then(() => this.exec());
    chain.catch(err => {
      log.error(err.message, '');
    });
  }
  initArgs() {
    // 初始化参数，区分cmd属性和传入参数
    this.cmd = this.argv[this.argv.length - 1];
    this.argv = this.argv.slice(0, this.argv.length - 1);
    log.verbose('initArgs cmd', JSON.stringify(this.cmd));
    log.verbose('initArgs argv', JSON.stringify(this.argv));
  }
  // eslint-disable-next-line class-methods-use-this
  init() {
    // 初始化方法，用于获取初始化参数，被后续具体实现覆盖
    throw new Error('init必须实现！');
  }
  // eslint-disable-next-line class-methods-use-this
  exec() {
    // 执行方法，被后续具体实现覆盖
    throw new Error('exec必须实现！');
  }
}

class Git {
  // simpleGit生成的git对象

  // 项目路径，默认为当前目录
  dir = '';
  constructor(argv) {
    const {
      dir
    } = argv || {};
    //  确定项目路径
    this.dir = dir || process.cwd();
    this.checkGit();
    this.git = simpleGit.simpleGit({
      baseDir: dir
    }); // SimpleGit实例
  }

  checkGit() {
    // 检查控制台是否以运行`git `开头的命令
    if (!shell.which('git')) {
      // 在控制台输出内容
      throw new Error(colors.red('抱歉，此命令需要git支持，请检查本地是否有此命令'));
    }
  }
  async gitClone(url) {
    var _this$git;
    log.verbose('git clone url', url);
    const spinner = ora({
      text: '获取代码中，请等待\n',
      prefixText: 'guide-cli'
    }).start();
    await ((_this$git = this.git) === null || _this$git === void 0 ? void 0 : _this$git.clone(url, './'));
    spinner.succeed('操作成功');
  }
  async commit() {
    // 1.生成开发分支
    // await this.getCorrectVersion();
    // // 2.检查stash区
    await this.checkStash();
    // 3.检查代码冲突
    await this.checkConflicted();
    // 4.检查未提交代码
    await this.checkNotCommitted();
    // 5.生成Commit
    await this.createCommitMsg();
  }
  async checkStash() {
    log.info('开始检查', 'stash记录');
    const stashList = await this.git.stashList();
    if (stashList.all.length > 0) {
      const {
        stashFlag
      } = await inquirer.prompt({
        type: 'confirm',
        name: 'stashFlag',
        default: false,
        message: `git中存在${stashList.all.length}条stash, 是否stash pop？`
      });
      if (stashFlag) {
        await this.git.stash(['pop']);
        log.success('stash pop成功');
      } else {
        log.info('忽略stash记录', '');
      }
    }
    log.success('检查通过', 'stash记录');
  }
  async checkConflicted() {
    log.info('开始检查', '代码冲突');
    const status = await this.git.status();
    if (status.conflicted.length > 0) {
      throw new Error('当前代码存在冲突，请手动处理合并后再试！');
    }
    log.success('检查通过', '没有代码冲突');
  }
  async checkNotCommitted() {
    log.info('开始检查', '未提交代码');
    const status = await this.git.status();
    if (status.not_added.length > 0 || status.created.length > 0 || status.deleted.length > 0 || status.modified.length > 0 || status.renamed.length > 0) {
      log.verbose('status', JSON.stringify(status));
      // 未添加的文件
      await this.git.add(status.not_added);
      // 新创建的文件
      await this.git.add(status.created);
      // 删除的文件
      await this.git.add(status.deleted);
      // 有修改的文件
      await this.git.add(status.modified);
      // 重命名的文件， 可通过git mv xx xx出现
      await this.git.add(status.renamed.map(item => item.to));
      log.success('已自动将工作区的内容提交的暂存区');
    }
    log.success('检查通过', '没有未提交代码');
  }
  async createCommitMsg() {
    log.info('开始检查', 'commit');
    // TODO: 后续应与commitLit联动
    const commitMsg = await this.inputCommitMsg();
    await this.git.commit(commitMsg);
    log.success('本次commit提交成功');
  }
  async inputCommitMsg() {
    const {
      commitType,
      message
    } = await inquirer.prompt([{
      type: 'list',
      name: 'commitType',
      message: '请选择项目模板',
      choices: GIT_COMMIT_CONFIG.map(item => ({
        value: item.value,
        name: item.name
      }))
    }, {
      type: 'input',
      name: 'message',
      message: '请输入内容:',
      validate(v) {
        return !!v.trim();
      }
    }]);
    await this.checkCommit(commitType, message);
    return `${commitType}: ${message}`;
  }
  async checkCommit(commitType, message) {
    const {
      flag
    } = await inquirer.prompt({
      type: 'confirm',
      name: 'flag',
      message: `请确认git commit是否为<${commitType}: ${message}>`,
      default: true
    });
    if (!flag) {
      throw new Error('用户需重新生成git commit');
    }
  }
}

const list = [{
  name: 'webpack5-react-ts-template',
  description: 'webpack5 + react18 + ts模板',
  type: 'git',
  url: 'https://github.com/CrayonPig/webpack5-react-ts-template.git'
}, {
  name: 'webpack5-vue3-ts-template',
  description: 'webpack5 + vue3 + ts模板',
  type: 'git',
  url: 'https://github.com/CrayonPig/webpack5-vue3-ts-template.git'
}];

function isDirEmpty(localPath) {
  let fileList = fs.readdirSync(localPath);
  // 文件过滤的逻辑
  fileList = fileList.filter(file => !file.startsWith('.') && ['node_modules'].indexOf(file) < 0);
  return !fileList || fileList.length <= 0;
}

class InitCommand extends Command {
  gitPath = '';
  initOpt = {};
  init() {
    this.gitPath = this.argv[0];
    this.initOpt = this.argv[this.argv.length - 1] || {};
  }
  async exec() {
    // 1、检查本地路径
    await this.checkLocalDir();
    // 2、根据模板或路径下载代码
    await this.initTemplate();
  }
  async checkLocalDir() {
    const localPath = process.cwd();
    let ifContinue = false;
    log.info('exec', JSON.stringify(this.initOpt.force));
    if (!isDirEmpty(localPath)) {
      if (!this.initOpt.force) {
        // 询问是否继续创建
        ifContinue = (await inquirer.prompt({
          type: 'confirm',
          name: 'ifContinue',
          default: false,
          message: '当前文件夹不为空，是否继续创建项目？'
        })).ifContinue;
        if (!ifContinue) {
          throw new Error(colors.red('用户手动取消'));
        }
      }
      // 2. 是否启动强制更新
      if (ifContinue || this.initOpt.force) {
        // 给用户做二次确认
        const {
          confirmDelete
        } = await inquirer.prompt({
          type: 'confirm',
          name: 'confirmDelete',
          default: false,
          message: '是否确认清空当前目录下的文件？'
        });
        if (confirmDelete) {
          // 清空当前目录
          fse.emptyDirSync(localPath);
          return true;
        }
        throw new Error(colors.red('需使用空白目录'));
      }
    }
    log.verbose('localPath', localPath);
    return true;
  }
  initTemplate() {
    if (!this.gitPath) {
      // 初始化参数不存在，调用内置模板
      log.verbose('调用预设模板', '');
      this.initProjectTemplate();
    } else if (this.gitPath.endsWith('.git') || this.gitPath.startsWith('git@')) {
      // .git 结尾或者git@开头，视为直接从git克隆
      log.verbose('直接从git克隆', '');
      new Git().gitClone(this.gitPath);
    } else {
      log.error('git地址错误', `${this.gitPath}不是有效的git地址`);
    }
  }
  // eslint-disable-next-line class-methods-use-this
  async initProjectTemplate() {
    const {
      templateUrl
    } = await inquirer.prompt({
      type: 'list',
      name: 'templateUrl',
      message: '请选择项目模板',
      choices: list.map(item => ({
        value: item.url,
        name: `${item.name}(${item.description})`
      }))
    });
    new Git().gitClone(templateUrl);
  }
}
function init(args) {
  return new InitCommand(args);
}

class PushCommand extends Command {
  init() {
    // 处理参数
    this.git = new Git();
  }
  exec() {
    try {
      this.git.commit();
    } catch (error) {
      log.error('push error', error.message);
      if (process.env.LOG_LEVEL === 'verbose') {
        console.log(error);
      }
    }
  }
}
function push(args) {
  return new PushCommand(args);
}

function exec(...argv) {
  const args = Array.prototype.slice.apply(argv);
  const cmd = args[args.length - 1];
  const cmdName = cmd.name();
  const cmdObj = Object.create(null);
  // 过滤无用的私有属性
  Object.keys(cmd).forEach(key => {
    if (Object.prototype.hasOwnProperty.call(cmd, key) && !key.startsWith('_') && key !== 'parent') {
      cmdObj[key] = cmd[key];
    }
  });
  args[args.length - 1] = cmdObj;
  if (cmdName === 'init') {
    init(args);
  } else if (cmdName === 'push') {
    push(args);
  }
}

const program = new commander.Command();
function registerCommand() {
  program.name(PKG_NAME).usage('<command> [options]').version(PKG_VERSION, '-V, --version', '版本信息').option('-d, --debug', '是否开启调试模式', false).allowUnknownOption();
  program.command('init [gitPath]').option('-f, --force', '是否强制初始化项目', false).action(exec);
  program.command('push').action(exec);
  // 开启debug模式
  program.on('option:debug', () => {
    if (program.opts().debug) {
      log.info('info', '您已开启调试模式');
      process.env.LOG_LEVEL = 'verbose';
    } else {
      process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
  });
  // 未知命令监听
  program.on('command:*', obj => {
    const availableCommands = program.commands.map(cmd => cmd.name());
    log.error(colors.red('未知的命令:'), obj[0]);
    if (availableCommands.length > 0) {
      log.info(colors.red('可用命令:'), availableCommands.join(','));
    }
  });
  program.parse(process.argv);
  if (program.args && program.args.length < 1) {
    // 不输入命令, 打印帮助文档
    program.outputHelp();
  }
}

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
  import('root-check').then(({
    default: rootCheck
  }) => {
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
    log.error('error', error.message);
  }
}

log.info('欢迎使用Guide-cli', '');
if (importLocal(__filename)) {
  // 加载依赖
  log.info('cli', '您正在使用本地依赖版本');
} else {
  // 当前项目运行
  core();
}
