---
title: '「教程」搭建Rustdesk服务器实现远程控制Win/Linux/Android/Mac'
description: '教程 搭建Rustdesk服务器实现远程控制Win/Linux/Android/Mac rustdesk顾名思义就是用rust搭建的远程桌面控制软件 每一个客户端都是既可以控制又可以被控，WEB除外（WEB端的控制做的真的不好） 实际上，我们都不需要自己搭建服务器就可以直接下载使'
createdAt: '2022-07-30T09:47:00Z'
oldId: 217
oldUrl: 'https://blog.hadream.ltd/index.php/archives/217/'
categories: ['tutorial']
tags: ['docker-compose', 'rustdesk']
---
# 教程-搭建Rustdesk服务器实现远程控制Win/Linux/Android/Mac
- rustdesk顾名思义就是用rust搭建的远程桌面控制软件
- 每一个客户端都是既可以控制又可以被控，WEB除外（WEB端的控制做的真的不好）
- 实际上，我们都不需要自己搭建服务器就可以直接下载使用其提供的免费控制服务器，但是这样就不有趣了，我们就来搭建一下

## 搭建方式
- 有很多种，可以选择「docker」「docker-compose」「二进制文件直接运行」

## 分解
- 分为两个服务端：hbbs和hbbr，分别是ID server和Relay server
- 这里我们选择docker-compose，最为方便便捷

## 安装docker-ce和docker-compose
- 自己去官网找[docker.com][1]

## 安装
- 首先cd 一个你喜欢的安装位置
- nano/vi docker-compose.yml
- 输入以下内容
```
version: '3'

networks:
  rustdesk-net:
    external: false

services:
  hbbs:
    container_name: hbbs
    ports:
      - 21115:21115
      - 21116:21116
      - 21116:21116/udp
      - 21118:21118
    image: rustdesk/rustdesk-server:latest
    command: hbbs -r example.com:21117
    volumes:
      - ./hbbs:/root
    networks:
      - rustdesk-net
    depends_on:
      - hbbr
    restart: unless-stopped

  hbbr:
    container_name: hbbr
    ports:
      - 21117:21117
      - 21119:21119
    image: rustdesk/rustdesk-server:latest
    command: hbbr
    volumes:
      - ./hbbr:/root
    networks:
      - rustdesk-net
    restart: unless-stopped
```
- Ctrl-X/:wq保存并退出
- 接着docker-compose up -d即可
- 别忘了开放以下端口：
  - 21116(tcp+udp)  21117 21118 21119
- 最后，如需要停止，请docker-compose stop；需要启动则docker-compose start

## 客户端配置
- 客户端下载之后，找到ID/Relay Server配置项
- 只需要填写ID server 和 relay server即可，都填写一样的，你的服务器的ip/domain即可
- 网上有教程第二个填写了ip:21116，是不对的，会被拒绝，要填写也是ip:21117


  [1]: http://docker.com
