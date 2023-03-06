import log from './log';

class Command {
  argv: Array<unknown> = [];

  cmd: { [key: string]: unknown } = {};

  constructor(argv: Array<unknown>) {
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
    chain.catch((err) => {
      log.error((err as Error).message, '');
    });
  }

  initArgs() {
    // 初始化参数，区分cmd属性和传入参数
    this.cmd = this.argv[this.argv.length - 1] as { [key: string]: unknown };
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

export default Command;
