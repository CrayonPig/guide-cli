#!/usr/bin/env node
'use strict';

var importLocal = require('import-local');
var log = require('npmlog');
var semver = require('semver');
var colors = require('colors');
var userHome = require('user-home');
var pathExists = require('path-exists');
var commander = require('commander');
var inquirer = require('inquirer');
var fse = require('fs-extra');
var shell = require('shelljs');
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
	"@types/inquirer": "^9.0.3",
	"@types/node": "^18.13.0",
	"@types/npmlog": "^4.1.4",
	"@types/root-check": "^1.0.0",
	"@types/semver": "^7.3.13",
	"@types/shelljs": "^0.8.11",
	"@types/user-home": "^2.0.0",
	eslint: "^8.34.0",
	"eslint-plugin-guide": "^0.0.3",
	rollup: "^3.17.2",
	"rollup-plugin-cleandir": "^2.0.0",
	"rollup-plugin-typescript2": "^0.34.1",
	typescript: "^4.9.5"
};
var dependencies = {
	colors: "^1.4.0",
	commander: "^10.0.0",
	"fs-extra": "^11.1.0",
	"import-local": "^3.1.0",
	inquirer: "^8.0.0",
	npmlog: "^7.0.1",
	"path-exists": "^4.0.0",
	"root-check": "^2.0.0",
	semver: "^7.3.8",
	shelljs: "^0.8.5",
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
const PKG_VERSION = pkg.version;

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

function checkGit() {
  // 检查控制台是否以运行`git `开头的命令
  if (!shell.which('git')) {
    // 在控制台输出内容
    throw new Error(colors.red('抱歉，此命令需要git支持，请检查本地是否有此命令'));
  }
}
function gitClone(url) {
  // git clone
  checkGit();
  const res = shell.exec(`git clone ${url} ./`, {
    silent: true
  });
  if (res.code !== 0) {
    log.error('git clone', res.stderr);
  } else {
    log.success(res.stderr);
    log.success('操作成功');
  }
  shell.exit(1);
}

var templateList = [{
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

async function initProjectTemplate() {
  const {
    templateUrl
  } = await inquirer.prompt({
    type: 'list',
    name: 'templateUrl',
    message: '请选择项目模板',
    choices: templateList.map(item => ({
      value: item.url,
      name: `${item.name}(${item.description})`
    }))
  });
  gitClone(templateUrl);
}
async function exec(cmd, options) {
  log.verbose('cmd', cmd);
  log.verbose('options', JSON.stringify(options));
  const localPath = process.cwd();
  let ifContinue = false;
  if (!isDirEmpty(localPath)) {
    if (!options.force) {
      // 询问是否继续创建
      ifContinue = (await inquirer.prompt({
        type: 'confirm',
        name: 'ifContinue',
        default: false,
        message: '当前文件夹不为空，是否继续创建项目？'
      })).ifContinue;
      if (!ifContinue) {
        return;
      }
    }
    // 2. 是否启动强制更新
    if (ifContinue || options.force) {
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
      } else {
        return;
      }
    }
  }
  log.verbose('localPath', localPath);
  if (!cmd) {
    // 初始化参数不存在，调用内置模板
    log.verbose('调用预设模板', '');
    initProjectTemplate();
  } else if (cmd !== null && cmd !== void 0 && cmd.endsWith('.git') || cmd !== null && cmd !== void 0 && cmd.startsWith('git@')) {
    // .git 结尾或者git@开头，视为直接从git克隆
    log.verbose('直接从git克隆', '');
    gitClone(cmd);
  } else {
    log.error('git地址错误', `${cmd}不是有效的git地址`);
  }
}

const program = new commander.Command();
function registerCommand() {
  program.name(PKG_NAME).usage('<command> [options]').version(PKG_VERSION, '-V, --version', '版本信息').option('-d, --debug', '是否开启调试模式', false).option('-tp, --targetPath <targetPath>', '是否制定本地调试文件路径', '').allowUnknownOption();
  program.command('init [projectName]').option('-f, --force', '是否强制初始化项目').action(exec);
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
  // 指定targetPath
  program.on('option:targetPath', () => {
    var _program$opts;
    process.env.CLI_TARGET_PATH = (_program$opts = program.opts()) === null || _program$opts === void 0 ? void 0 : _program$opts.targetPath;
    log.info('targetPath已指定为', process.env.CLI_TARGET_PATH);
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
function prepare() {
  checkNodeVersion();
  checkRoot();
  checkUserHome();
}
function core() {
  try {
    prepare();
    registerCommand();
  } catch (error) {
    log.error('error', error.message);
  }
}

log.info('欢迎使用Guide-cli，欢迎提PR', '');
if (importLocal(__filename)) {
  // 加载依赖
  log.info('cli', '您正在使用本地依赖版本');
} else {
  // 当前项目运行
  core();
}
