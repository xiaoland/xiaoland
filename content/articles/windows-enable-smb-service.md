---
title: '「教程」Windows开启SMB服务'
description: '因为需要把主力机上的图片等给服务器访问，所以就打算使用smb共享 SMB共享的优势在于：简便、linux支持挂载（虽然现在还在用户态下运行） 这之中还踩了不少坑，我们一起来看看。'
createdAt: '2023-09-23T12:34:00Z'
oldId: 332
oldUrl: 'https://blog.hadream.ltd/index.php/archives/332/'
categories: ['tutorial-server', 'tutorial']
tags: ['smb']
---

缘由：

- 因为需要把主力机上的图片等给服务器访问，所以就打算使用smb共享
- SMB共享的优势在于：简便、linux支持挂载（虽然现在还在用户态下运行）
- 这之中还踩了不少坑，我们一起来看看：
  - 字符集问题
  - SMB版本问题
  - SMB用户名问题
  - "掉盘"问题

### 在Windows上开启SMB服务

> 参考文章：[https://blog.csdn.net/u014361280/article/details/113678753][1]

1. 控制面板-程序-启用或关闭windows功能-SMB 1.0/CIFS 文件共享支持，勾选后保存
2. 重启
3. 切换SMB协议为v2（v1已经不被Linux支持）
   - 参考文章：[https://www.landiannews.com/archives/93548.html][2]
   - 打开管理员模式的PowerShell
   - 检测是否已经开启 `Get-SmbServerConfiguration | Select EnableSMB2Protocol`
   - 开启SMBv2 `Set-SmbServerConfiguration -EnableSMB2Protocol $true`

### 共享Windows文件夹

1. 添加共享账户：进入电脑管理-本地用户和组-用户，然后 行为-新用户
   - ![电脑管理][3]
   - 用户名：不推荐使用中文名，不推荐使用特殊符号；密码：Linux系统中bash无需转义的符号
2. 选中一个文件夹/磁盘，右键选择属性-共享-高级设置-权限-添加，然后添加刚刚创建的用户，别忘了勾选所有权限

### 在Linux上挂载SMB文件夹

`mount -t smbfs -o iocharset=utf8,username=用户名,password=密码, -l //ip地址/共享文件夹名 挂载点`


[1]: https://blog.csdn.net/u014361280/article/details/113678753
[2]: https://www.landiannews.com/archives/93548.html
[3]: https://oss.lanzhijiang.dev/xiaoland/images/articles/windows-enable-smb-service/17acccb46b69a83d8fd9712ee233-95b4f0ec.jpg
