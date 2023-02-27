import inquirer from 'inquirer';
import fse from 'fs-extra';
import log from '@/utils/log';
import { gitClone } from '@/utils/git';
import templateList from '@/utils/template';
import { isDirEmpty } from '@/utils/index';

interface IInitCmdOpt {
  force?: boolean;
}

async function initProjectTemplate() {
  const { templateUrl } = await inquirer.prompt({
    type: 'list',
    name: 'templateUrl',
    message: '请选择项目模板',
    choices: templateList.map((item: ITemplateItem) => ({
      value: item.url,
      name: `${item.name}(${item.description})`
    }))
  });
  gitClone(templateUrl);
}

export default async function exec(cmd: string, options: IInitCmdOpt) {
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
      const { confirmDelete } = await inquirer.prompt({
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
  } else if (cmd?.endsWith('.git') || cmd?.startsWith('git@')) {
    // .git 结尾或者git@开头，视为直接从git克隆
    log.verbose('直接从git克隆', '');
    gitClone(cmd);
  } else {
    log.error('git地址错误', `${cmd}不是有效的git地址`);
  }
}
