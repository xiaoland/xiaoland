---
title: '「教程」docker部署OnlyOffice服务器'
description: '教程：docker部署Onlyoffice服务器 本文将会介绍如何在Linux上使用docker compose部署onlyoffice的DocumentServer服务 onlyoffice DS的部署将是非常有用的 部署完毕之后，你可以在nextcloud、DzzOffice'
createdAt: '2021-08-02T06:46:00Z'
oldId: 130
oldUrl: 'https://blog.hadream.ltd/index.php/archives/130/'
categories: ['tutorial-server', 'tutorial']
tags: ['onlyoffice']
---
- 本文将会介绍如何在Linux上使用docker-compose部署onlyoffice的DocumentServer服务
- onlyoffice-DS的部署将是非常有用的
  部署完毕之后，你可以在nextcloud、DzzOffice上连接它以实现在线编辑office文件，甚至还可以参考官方API开发自己的在线编辑器
- 本文实验环境为centos7.6，在centos8.3也实验过一遍，都是成功的
- 使用docker-compose部署的优点
  - 我们都知道onlyoffice的配置准备及其复杂，又是redis，又是postgresql，还有什么rabbitmq的，非常难搞
  - 而docker-compose直接一个运行，就可以自动部署好整一个onlyoffice服务，包括上面提及的前置

### 目录
- 0.安装docker（若你没有docker，docker-compose将是徒劳）
- 1.安装docker-compose
- 2.安装onlyoffice
  - 2.1下载安装包
  - 2.2修改docker-compose.yml
  - 2.3安装

### 0. 安装docker
- 非常地简单，参考：https://docs.docker.com/get-docker/
- 在centos下，如此操作：
  - `yum install -y yum-utils`
  - `yum yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo`
  - `yum install docker-ce docker-ce-cli containerd.io`
- 启动：
  - `systemctl start docker`
  - 如果报错，尝试先`systemctl start docker.socket`
  - 如果仍然报错，请`systemctl status docker`查看错误报告以定位问题自行解决

### 1. 安装docker-compose
- 很简单，操作就是下载docker-compose运行文件，然后将其链接/放到 /usr/bin下，这样就可以从bash直接运行了
  - `curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`
    - 太慢下载不动，可以将uanme -s | uname -m 的值分别填入地址中获取之后下载到系统上
    - 但注意docker-compose应下载到/usr/local/bin下
  - `chmod +x /usr/local/bin/docker-compose` 赋予执行权限
  - `ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose` 使其可以在bash中运行
- 测试
  - `docker-compose --version` -> "docker-compose version 1.29.2, build 1110ad01"

### 2. 安装onlyoffice
#### 2.1 下载安装包
- `git clone https://github.com/ONLYOFFICE/Docker-DocumentServer`
  - 下载太慢可以在电脑上下载之后上传到服务器上：http://tencent.hadream.ltd:84/sharing/Docker-DocumentServer.zip
    再解压
#### 修改docker-compose.yml
- `cd Docker-DocumentServer`
- 在docker-compose.yml找到容器端口映射的地方，根据自己的需要设置好，避免端口冲突导致启动失败
  - ![屏幕截图 2021-08-02 150848.png][1]
  - 说明：宿主机端口:容器端口 仅修改宿主机端口即可
#### 安装
- `docker-compose up -d`
- 停止onlyoffice：`docker-compose down`
- 现在，访问http://<your-host>:port就可以看到如下的页面啦：
  - ![屏幕截图 2021-08-02 151233.png][2]

### 参考文章
- [helpcenter.onlyoffice.com](https://helpcenter.onlyoffice.com/installation/docs-community-docker-compose.aspx)
- [docs.docker.com](https://docs.docker.com/engine/install/centos/)

  [1]: https://oss.lanzhijiang.dev/xiaoland/images/articles/docker-onlyoffice-server/468688232-907d17f2.png
  [2]: https://oss.lanzhijiang.dev/xiaoland/images/articles/docker-onlyoffice-server/1351014222-2b8a087a.png
