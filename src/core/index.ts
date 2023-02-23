import semver from 'semver';
import colors from 'colors';
import userHome from 'user-home';
import { pathExistsSync } from 'path-exists';
import { Command } from 'commander';
import log from '../utils/log';
import { LOWEST_NODE_VERSION, PKG_NAME, PKG_VERSION } from '@/utils/const';

interface IProgramProps extends Command {
  debug?: boolean;
  targetPath?: string;
}

const program: IProgramProps = new Command();

function registerCommand() {
  program
    .name(PKG_NAME)
    .usage('<command> [options]')
    .version(PKG_VERSION, '-V, --version', '版本信息')
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否制定本地调试文件路径', '');

  // program
  //   .command('init [projectName]')
  //   .option('-f, --force', '是否强制初始化项目')
  //   .action(exec);

  // 开启debug模式
  program.on('option:debug', () => {
    if (program.debug) {
      log.info('info', '您已开启调试模式');
      process.env.LOG_LEVEL = 'verbose';
    } else {
      process.env.LOG_LEVEL = 'info';
    }
    log.level = process.env.LOG_LEVEL;
  });

  // 指定targetPath
  program.on('option:targetPath', () => {
    process.env.CLI_TARGET_PATH = program.targetPath || '';
    log.info('targetPath已指定为', process.env.CLI_TARGET_PATH);
  });

  // 未知命令监听
  program.on('command:*', (obj) => {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    log.error('', colors.red(`未知的命令:${obj[0]}`));
    if (availableCommands.length > 0) {
      log.error('', colors.red(`可用命令:${availableCommands.join(',')}`));
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
  log.info('userHome', userHome);
  if (!userHome || !pathExistsSync(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在'));
  }
}

function checkRoot() {
  // TODO: 执行报错
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

function prepare() {
  checkNodeVersion();
  // checkRoot();
  checkUserHome();
}

function core() {
  // log.info('argv', JSON.stringify(argv));
  try {
    prepare();
    registerCommand();
  } catch (error) {
    log.error('error', (error as Error).message);
    if (program?.debug) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
}

export default core;
