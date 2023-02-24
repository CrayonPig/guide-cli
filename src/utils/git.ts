import shell from 'shelljs';
import colors from 'colors';
import log from './log';

function checkGit() {
  // 检查控制台是否以运行`git `开头的命令
  if (!shell.which('git')) {
  // 在控制台输出内容
    throw new Error(colors.red('抱歉，此命令需要git支持，请检查本地是否有此命令'));
  }
}

export function gitClone(url: string) {
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

export function gitCommit() {
//
}
