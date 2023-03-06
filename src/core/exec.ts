import { init } from '@/commands/init';
import { push } from '@/commands/push';
import log from '@/utils/log';

function exec(...argv: Array<unknown>) {
  const args = Array.prototype.slice.apply(argv);
  const cmd = args[args.length - 1];
  const cmdName = cmd.name();
  const cmdObj = Object.create(null);

  // 过滤无用的私有属性
  Object.keys(cmd).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(cmd, key)
      && !key.startsWith('_')
      && key !== 'parent') {
      cmdObj[key] = cmd[key];
    }
  });

  args[args.length - 1] = cmdObj;

  if (cmdName === 'init') {
    init(args);
  } else if (cmdName === 'push') {
    push(args);
  }
}

export default exec;
