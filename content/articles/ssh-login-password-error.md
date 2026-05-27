---
title: '「问题解决」SSH无法登录或密码错误'
description: '问题解决 SSH无法登录或密码错误 本文章记录了遇到SSH限制 root 登录或者总是密码错误的情况的解决方法 问题描述 该问题发现于Ubuntu18.04.4 LTS中 表现为远端登录ssh时出现"Permission denied"或者总是密码错误 原因 ssh配置文件禁止了'
createdAt: '2021-07-26T16:31:00Z'
oldId: 110
oldUrl: 'https://blog.hadream.ltd/index.php/archives/110/'
categories: ['tutorial-it', 'tutorial']
tags: ['ssh']
---
# 问题解决-SSH无法登录或密码错误
- 本文章记录了遇到SSH限制(root)登录或者总是密码错误的情况的解决方法

### 问题描述
- 该问题发现于Ubuntu18.04.4 LTS中
- 表现为远端登录ssh时出现"Permission denied"或者总是密码错误

### 原因
- ssh配置文件禁止了远端登录/禁止了root用户登录/禁止了密码认证
- 常见于Ubuntu18.04.4中，其对ssh的默认设置就是拒绝远端/root/密码登录的

### 解决方法
- 使用编辑器打开/etc/ssh/sshd_config: `nano /etc/ssh/sshd_config`
- 去除以下项目的注释（若后面的值不同，请修改成与下方相同的值）：
  - `AddressFamily any`
  - `PermitRootLogin yes`
  - `PasswordAuthentication yes`
- 重启ssh服务: `service ssh restart` `systemctl restart ssh`

### 参考文章：
- https://blog.csdn.net/weixin_43319635/article/details/105440404
