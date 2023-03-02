import { Command } from 'commander';
import colors from 'colors';
import { PKG_NAME, PKG_VERSION } from '@/utils/const';
import log from '@/utils/log';
import exec from './exec';

const program = new Command();

function registerCommand() {
  program
    .name(PKG_NAME)
    .usage('<command> [options]')
    .version(PKG_VERSION, '-V, --version', '版本信息')
    .option('-d, --debug', '是否开启调试模式', false)
    .allowUnknownOption();

  program
    .command('init [gitPath]')
    .option('-f, --force', '是否强制初始化项目', false)
    .action(exec);

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
  program.on('command:*', (obj) => {
    const availableCommands = program.commands.map((cmd) => cmd.name());
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

export default registerCommand;
