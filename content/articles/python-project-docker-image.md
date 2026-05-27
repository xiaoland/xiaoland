---
title: '「教程」制作Python项目Docker镜像'
description: '教程 制作python项目docker镜像 因为有一个项目运行在树莓派上面，有好几个子Python项目要运行，所以做了一个控制app 但是即便如此，通过脚本运行还是很不方便，状态管理也很麻烦，所以就打算用docker来实现 其实docker本质就是一整个系统 运行环境 你能学到什'
createdAt: '2023-08-14T12:27:00Z'
oldId: 278
oldUrl: 'https://blog.hadream.ltd/index.php/archives/278/'
categories: ['tutorial-it', 'tutorial']
tags: ['docker', 'python']
---
# 教程-制作python项目docker镜像
- 因为有一个项目运行在树莓派上面，有好几个子Python项目要运行，所以做了一个控制app
  但是即便如此，通过脚本运行还是很不方便，状态管理也很麻烦，所以就打算用docker来实现
- 其实docker本质就是一整个系统(运行环境)

### 你能学到什么
- 怎样构建一个能够运行Python项目的docker镜像
- 然后，我们把你需要的包(需要pip进行安装的包)写入`requirements.txt`之中 (怎么叫都可以，但已经约定俗成了)
- 通过requirements.txt，我们可以批量为新的python环境安装包。其中每一行一个包，且可以通过如下的符号来指定版本
```
flask==1.1.2
requests
pyaudio>=0.9
```

### 前置条件
- 运行Python项目需要对应的python解释器版本与python包
- 构建docker容器，你需要先安装docker(docker-ce)

### 主要步骤
- 确定Python环境
- 构建镜像
- 导出与导入镜像
- 运行镜像创建容器

### 确定Python环境
- 一般来说，通过`python -m pip list`就可以找到当前python环境已经安装的所有包

### 构建镜像
- Docker构建镜像通过目标目录下的Dockerfile来进行

#### 编写Dockerfile
- [查看实例文件]
- 不知道为什么解释打不上来，相信大家自己能够理解的

#### 构建

### 导出与导入

### 运行
