import shell from 'shelljs';
import colors from 'colors';
import { simpleGit, SimpleGit } from 'simple-git';
import ora from 'ora';
import inquirer from 'inquirer';
import log from './log';
import { GIT_COMMIT_CONFIG } from './const';

interface IGitProps {
  dir: string;
}

class Git {
  // simpleGit生成的git对象
  git: SimpleGit;

  // 项目路径，默认为当前目录
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
    // 5.生成Commit
    await this.createCommitMsg();
  }

  async checkStash() {
    log.info('开始检查', 'stash记录');
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
    const { commitType, message } = await inquirer.prompt([{
      type: 'list',
      name: 'commitType',
      message: '请选择项目模板',
      choices: GIT_COMMIT_CONFIG.map((item) => ({
        value: item.value,
        name: item.name
      }))
    }, {
      type: 'input',
      name: 'message',
      message: '请输入内容:',
      validate(v: string) {
        return !!v.trim();
      }
    }]);
    await this.checkCommit(commitType, message);
    return `${commitType}: ${message}`;
  }

  async checkCommit(commitType:string, message: string) {
    const { flag } = await inquirer.prompt({
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

export default Git;
