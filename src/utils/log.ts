import log from 'npmlog';
import { PKG_NAME } from './const';

log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'; // 判断debug模式
log.heading = PKG_NAME; // 修改前缀
log.headingStyle = { fg: 'green', bg: 'black' };
log.addLevel('success', 2000, { fg: 'green', bold: true }); // 添加自定义命令

export default log;
