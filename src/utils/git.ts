import shell from 'shelljs';
import colors from 'colors';
import { simpleGit, SimpleGit } from 'simple-git';
import ora from 'ora';
import inquirer from 'inquirer';
import log from './log';

interface IGitProps {
  dir: string;
}

class Git {
  git: SimpleGit;

  dir = '';

  constructor(argv?: IGitProps) {
    const { dir } = argv || {};
    //  确定项目路径
    this.dir = dir || process.cwd();
    this.checkGit();
    this.git = simpleGit({
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

  async gitClone(url: string) {
    log.verbose('git clone url', url);
    const spinner = ora({
      text: '获取代码中，请等待\n',
      prefixText: 'guide-cli'
    }).start();

    await this.git?.clone(url, './');
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
  }

  async checkStash() {
    log.info('检查stash记录', '');
    const stashList = await this.git.stashList();

    if (stashList.all.length > 0) {
      const { stashFlag } = (await inquirer.prompt({
        type: 'confirm',
        name: 'stashFlag',
        default: false,
        message: `git中存在${stashList.all.length}条stash, 是否stash pop？`
      }));
      if (stashFlag) {
        await this.git.stash(['pop']);
        log.success('stash pop成功');
      } else {
        log.info('忽略stash记录', '');
      }
    }
  }

  async checkConflicted() {
    log.info('代码冲突检查', '');
    const status = await this.git.status();
    if (status.conflicted.length > 0) {
      throw new Error('当前代码存在冲突，请手动处理合并后再试！');
    }
    log.success('代码冲突检查通过');
  }

  async checkNotCommitted() {
    const status = await this.git.status();
    if (status.not_added.length > 0
      || status.created.length > 0
      || status.deleted.length > 0
      || status.modified.length > 0
      || status.renamed.length > 0
    ) {
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
      await this.git.add(status.renamed.map((item) => item.to));

      // log.success('本次commit提交成功');
    }
  }
}

export default Git;
