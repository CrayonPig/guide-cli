import inquirer from 'inquirer';
import fse from 'fs-extra';
import colors from 'colors';
import Command from '@/utils/command';
import log from '@/utils/log';
import Git from '@/utils/git';
import templateList from '@/utils/template';
import { isDirEmpty } from '@/utils/index';

interface IInitCmdOpt {
  force?: boolean;
}

export class InitCommand extends Command {
  gitPath = '';

  initOpt: IInitCmdOpt = {};

  init() {
    this.gitPath = this.argv[0] as string;
    this.initOpt = this.argv[this.argv.length - 1] as IInitCmdOpt || {};
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
        const { confirmDelete } = await inquirer.prompt({
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
    const { templateUrl } = await inquirer.prompt({
      type: 'list',
      name: 'templateUrl',
      message: '请选择项目模板',
      choices: templateList.map((item: ITemplateItem) => ({
        value: item.url,
        name: `${item.name}(${item.description})`
      }))
    });
    new Git().gitClone(templateUrl);
  }
}

export function init(args: Array<unknown>) {
  return new InitCommand(args);
}
