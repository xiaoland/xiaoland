---
title: '「教程」在Centos上用源码安装Nginx'
description: '关于如何在Centos上用源码安装Nginx 本文章包括了： nginx配置 nginx的基本操作 配置一个网站 前言 nginx是一个与apache httpd 同类型的东西，可以简单地理解为一个web服务器 nginx比较轻量，使用它我们可以轻易做到不同网站不同php、反向代'
createdAt: '2021-03-07T05:57:00Z'
oldId: 10
oldUrl: 'https://blog.hadream.ltd/index.php/archives/10/'
categories: ['tutorial-it', 'tutorial']
tags: ['nginx']
---
- 本文章包括了：
  - nginx配置
  - nginx的基本操作
  - 配置一个网站

## 前言
- nginx是一个与apache(httpd)同类型的东西，可以简单地理解为一个web服务器
- nginx比较轻量，使用它我们可以轻易做到不同网站不同php、反向代理等等
- 因为我用的就是Centos，所以我也就写是centos，当然，本教程用源码安装，所以其实在linux上应该都是可以的
  - PS：只要选对nginx源码的架构和系统

## 下载源码
- [NGINX官网下载](http://nginx.org/en/download.html)
- 选择适合你的CHARACTER吧！
- 当然，你可以直接wget到服务器上，也可以选择下载以后再ftp过去等等

## 解压
```bash
tar -zxvf nginx-x-xx.tar.gz
```
- 总之，把你的nginx源码解压出来，并命名文件夹为nginx
- 在哪里解压不重要（大概），但是还是推荐解压在/usr/local下

## 安装
### 安装依赖
- 在没有这些依赖的情况下，安装nginx是会报错的，所以先安装环境
```bash
yum install -y gcc-c++ pcre pcre-devel zlib zlib-devel openssl openssl-devel
```
### 安装nginx
- 接着，进入到nginx目录下，使用老套路
```bash
cd nginx
./configure
make && make install
```
- PS：在./configure部分，可以添加参数以添加各种扩展和调整安装目录等
  - 很重要的一点就是解决*"conf/koi-win" 与"/usr/local/nginx/conf/koi-win" 为同一文件*这个问题
  - 要解决这个问题，可以使用`./configure --prefix=<path_install_nginx> --conf-path=<path_to_nginx_conf>`
    - "--prefix"项指定nginx的安装目录，之后会在指定的目录下生成各种文件
    - "--conf-path"则指定nginx的配置文件路径，当你有两个nginx时，这个是很必要的
  - 你还可以使用"--add-moudle=xxxx"来安装各种各样的拓展模块

## 启动
- 安装完之后默认就已经启动了
- 如果80端口被占用或者你想要重启或更改配置什么的，请看[「教程」Centos上的nginx使用](http://blog.hadream.ltd/index.php/archives/20/)
