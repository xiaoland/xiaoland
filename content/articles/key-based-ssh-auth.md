---
title: '密钥认证SSH'
description: '大家都知道密钥登录好，比密码安全、快速还简单，这里写一篇简明的教程，网络上各种教程杂七杂八拼凑在一起也能成，但是还有不少坑 基础知识 密钥对 sshd sshd（Secure Shell Daemon）是 SSH（Secure Shell）协议的服务器端程序。 就是它负责认证的事'
createdAt: '2025-05-28T11:23:00Z'
oldId: 451
oldUrl: 'https://blog.hadream.ltd/index.php/archives/451/'
categories: ['tutorial-it']
tags: ['ssh']
---
大家都知道密钥登录好，比密码安全、快速还简单，这里写一篇简明的教程，网络上各种教程杂七杂八拼凑在一起也能成，但是还有不少坑

## 基础知识
### 密钥对

### `sshd`
sshd（Secure Shell Daemon）是 SSH（Secure Shell）协议的服务器端程序。

就是它负责认证的事情，所以如果登录不上，八成排查这里。

## 简明步骤
1. 在你的计算机（不是服务器！）上，使用ssh-keygen工具生成一个密钥对，建议使用ed25519算法生成

```bash
ssh-keygen -t ed25519
```

将你的私钥保存到当前用户（Windows的`%USERDATA%`）的`.ssh`文件夹中

2. 在你的服务器上，创建一个属于你的账号

```bash
sudo useradd username
sudo passwd username
sudo usermod -a -G wheel username
```

第三条命令赋予该新创建的用户`sudo`权限（通过添加到`wheel`或`sudo`用户组来完成）

3. 登录该用户 `su username`，并创建存放刚才公钥的文件

```bash
mkdir ~/.ssh
vi ~/.ssh/authorized_keys
```

在 `authorized_keys` 中存放的是可以登录当前账号（`~`指向当前用户的家目录）的公钥，一行一个

4. 重启sshd服务

```bash
sudo systemctl restart sshd
```

## 问题排查
### sshd配置可登录用户
在 `/etc/ssh/sshd_config` 文件中有 `AllowUsers` 配置项，用空格分隔可以通过ssh登录的用户名，不填写则默认全部

### sshd配置可密钥登录
```txt
RSAAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PasswordAuthentication no  # 可选的
```
