import Command from '@/utils/command';
import Git from '@/utils/git';
import log from '@/utils/log';

export class PushCommand extends Command {
  git: any;

  init() {
    // 处理参数
    this.git = new Git();
  }

  exec() {
    try {
      this.git.commit();
    } catch (error) {
      log.error('push error', (error as Error).message);
      if (process.env.LOG_LEVEL === 'verbose') {
        console.log(error);
      }
    }
  }
}

export function push(args: Array<unknown>) {
  return new PushCommand(args);
}
