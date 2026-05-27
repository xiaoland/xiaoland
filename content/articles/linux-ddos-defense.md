---
title: '「教程」Linux防御DDoS攻击'
description: '教程 Linux防御软件型DDoS攻击 相信大家都知道DDoS攻击的危害性是极大的，造成的损失不计其数 昨天我的服务器就被DDoS攻击了，给我带来了巨额的流量账单和服务器响应慢速 还好目前我受到的只是 大量连接型 DDoS攻击 查看网络连接数 我们可以通过netstat来查看连接'
createdAt: '2021-05-23T03:18:00Z'
oldId: 74
oldUrl: 'https://blog.hadream.ltd/index.php/archives/74/'
categories: ['tutorial-it', 'tutorial']
tags: ['ddos']
---
# 教程-Linux防御软件型DDoS攻击
- 相信大家都知道DDoS攻击的危害性是极大的，造成的损失不计其数
- 昨天我的服务器就被DDoS攻击了，给我带来了巨额的流量账单和服务器响应慢速
- 还好目前我受到的只是**大量连接型**DDoS攻击

## 查看网络连接数
- 我们可以通过netstat来查看连接到你的服务器上的ip及其连接数目统计
- 正因为DDoS实现的手段是通过多个ip的大量请求已至服务器瘫痪。所以我们可以这样子进行检测
- `netstat -ntu | awk '{print $5}' | cut -d: -f1 | uniq -c | sort -n`

## 解决方案
- 有一款轻量的防DDoS攻击脚本：DDoS deflate
- 其工作原理就是：检测连接情况->大于一定阈值的ip封禁一定时间

## 安装DDoS deflate
- `wget http://www.inetbase.com/scripts/ddos/install.sh`
- `chmod +x install.sh `
- `./install.sh` (注意！需要网络） 
- 安装结束以后会有协议书，按'q'退出
- 之后就可以在/usr/local/ddos里面找到其配置文件等

## 配置DDoS deflate
```bash
cd /usr/local/ddos
nano ddos.conf
```

输入以下内容：

```txt
PROGDIR="/usr/local/ddos" #文件存放目录
PROG="/usr/local/ddos/ddos.sh" #主要功能脚本
IGNORE_IP_LIST="/usr/local/ddos/ignore.ip.list" #可以设置IP白名单
CRON="/etc/cron.d/ddos.cron" #crond定时任务脚本
APF="/etc/apf/apf"          #这两项应该分别对应使用APF或者iptables配置目录不过笔者
IPT="/sbin/iptables"        #尝试打开文件里边是乱码，有哪位大牛知道是干嘛的欢迎留言
FREQ=1 #间隔多久检查一次，默认1分钟
NO_OF_CONNECTIONS=150 #最大连接数设置，超过这个数字的IP就会被屏蔽
APF_BAN=0 #1：使用APF，0：使用iptables，推荐使用iptables
KILL=1    #是否屏蔽IP 1：屏蔽，0：不屏蔽
EMAIL_TO="root" #发送电子邮件报警的邮箱地址，换成自己使用的邮箱
BAN_PERIOD=600  #禁用IP时间，可根据情况调整，默认单位：秒
```

修改 `/etc/cron.d/ddos.cron` 中的内容：
```txt
SHELL=/bin/sh
1 * * * * root /usr/local/ddos/ddos.sh >/dev/null 2>&1‘
# 现在是1min检查一次，可以根据自己的需要修改
```
运行 `tail -f /var/log/cron` 来查看 crond 的日志，从而确定 ddos.sh 有被正常执行

## 测试
- 我们这样模拟ddos攻击：
  - `ab -n 1000 -c 10 你的服务器地址（可访问的端口）`
- 然后每一分钟就查看一下iptables策略
  - `iptables -nL`
  - 你就可以知道那些请求大的ip有没有被封禁了
- 其实这个脚本对于那种以大量请求占用宽带的攻击方式都是有用的，比如CC攻击

## 卸载DDoS deflate
- `wget http://www.inetbase.com/scripts/ddos/uninstall.ddos`
- `chmod +x uninstall.ddos `
- `./uninstall.ddos `

## 参考文章：
- https://www.cnblogs.com/bigdevilking/p/9375287.html
- https://blog.csdn.net/sunguoqiang1213/article/details/78349690
