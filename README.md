# GUIDE-Cli
开箱即用的前端命令行工具

## 功能项
- [ ] cli版本检测及更新
- [x] git clone 
- [x] 固定代码模板 clone
- [ ] 自定义代码模板
- [ ] git commit 提示

## 使用
### 安装
```shell
npm install guide-cli -g
```
### 代码初始化
从代码模板中创建项目
```
guide-cli init
```

从git项目中初始化，命令等价于 git clone xxx ./
```
guide-cli init [git url]
``` 

通过额外参数 `-f`，可以强制初始化项目。