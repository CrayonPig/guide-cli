import fs from 'fs';

export function isObject(o: unknown) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

export function isDirEmpty(localPath: string) {
  let fileList = fs.readdirSync(localPath);
  // 文件过滤的逻辑
  fileList = fileList.filter((file) => (
    !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
  ));
  return !fileList || fileList.length <= 0;
}
