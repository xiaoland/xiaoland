---
title: '「教程」Centos上的nginx使用'
description: '关于Centos上的Nginx的使用 本文介绍了nginx的基本使用 包括重启，开机自启动等等 还包括 设置网站地址 ，设置 多个不同网站 和 不同php版本 日后还会陆续增加哦 启动、停止、重启 要执行这些操作，最根本的是找到nginx的核心（仅是编译安装的情况下） 若是直接包'
createdAt: '2021-03-13T17:40:00Z'
oldId: 20
oldUrl: 'https://blog.hadream.ltd/index.php/archives/20/'
categories: ['tutorial-server', 'tutorial']
tags: ['nginx']
---
# 关于Centos上的Nginx的使用

- 本文介绍了nginx的基本使用
- 包括重启，开机自启动等等
- 还包括**设置网站地址**，设置**多个不同网站**和**不同php版本**
- 日后还会陆续增加哦

## 启动、停止、重启
- 要执行这些操作，最根本的是找到nginx的核心（仅是编译安装的情况下）
  - 若是直接包安装，使用systemctl stop/start/restart nginx就可以了
### nginx核心在哪里
- 一般情况下nginx的核心文件在你安装nginx的那个文件夹下的sbin或objs文件夹中
  - 如：/usr/local/nginx是你安装nginx的位置 
  - 那/usr/local/nginx/sbin/或/usr/local/nginx/objs中的nginx这个文件就是nginx的核心
### 三指令
- 启动，配置文件可以不指定，要指定就是nginx.conf
```bash
nginx -c 你的配置文件
```
- 停止
```bash
nginx -s stop
nginx -s quit
```
- 重启
```bash
nginx -s reload
```
- ATTENTION: 如果说找不到指令nginx
  - 请在环境变量中添加nginx或者你直接指定到nginx文件
  - 就像：/usr/local/nginx/sbin/nginx -s reload

## 多个网站不同php版本
- 在配置多个网站之前，我们先来看看一个网站的配置是怎样的吧
### nginx的配置
- nginx的配置文件一般位于其安装目录下的conf/nginx.conf
- 现在，让我给你一个模板的一部分
```conf
events {
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       81;
        server_name  localhost;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;
        

        location / {
            root   /home/nginx_www/typecho;
            index  index.html index.htm index.php;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

        location ~ .*\.php(\/.*)*$ {
            root           /home/nginx_www/typecho;
            fastcgi_pass   127.0.0.1:9002;
            fastcgi_index  index.php;
            fastcgi_split_path_info ^(.+?.php)(/.*)$;
            set $path_info "";
            set $real_script_name $fastcgi_script_name;
            if ($fastcgi_script_name ~ "^(.+?\.php)(/.+)$") {
                set $real_script_name $1;
                set $path_info $2;
            }
            fastcgi_param  SCRIPT_NAME $real_script_name;
            fastcgi_param  PATH_INFO $path_info;
            fastcgi_param  SCRIPT_FILENAME /home/nginx_www/typecho$fastcgi_script_name;
            include        fastcgi_params;
        }
    }
}
```
- 好了，没有必要去仔细地解析这个配置，让我来告诉你就好

### 配置不同php版本
- 我们的目的就在于「多个网站」「不同php」而已

- 可以发现，在http下的server其实就是一个网站的配置

  - 每个网站允许拥有自己的php版本，自己的端口号，自己的目录，自己的各种配置

- 上面的是本网站的nginx的配置，这个是基本版的

  ```conf
  server {
      listen       8000;
      server_name  somename;
      
      location / {
          root   /home/www/;
          index  index.html index.htm index.php;
      }
      
      location ~ \.php$ {
              root           /home/www;
              fastcgi_pass   127.0.0.1:9000;
              fastcgi_index  index.php;
              fastcgi_param  SCRIPT_FILENAME   /scripts$fastcgi_script_name;
              include        fastcgi_params;
          }
  }
  ```

| 字段          | 说明                                           |
| :------------- | :---------------------------------------------- |
| server_name   | 一个名称，你喜欢就好                           |
| listen        | 网站的监听端口；使用https协议加上ssl: 8000 ssl |
| location      | 路由设置                                       |
| root          | 每个路由对应的工作文件夹                       |
| index         | 地址栏进入后加载的文件                         |
| fastcgi_pass  | php的fastcgi的地址                             |
| fastcgi_index | 被访问时fastcgi加载的文件                      |

- 这里就不多做详细解释了，要设置多个网站，只需要设置多个server就可以了
- 而需要不同网站不同工作目录，要改所有location（一个server内的）参数下的root参数
- 要不同网站不同php版本，只需要在对php配置（location ~ \.php$）中设置fastcgi_pass为对应版本php的fastcgi地址即可
  - 就像是你的php7.3设置了fastcgi端口为9000，那么要用php7的server就设置为127.0.0.1:9000
  - php5.6设置了fastcgi端口为9001，那么要用php5的server就设置为127.0.0.1:9001

### 配置多个网站
- 其实就是在http中多几个server的意思
- 一个server就是一个网站站点，可以给它们指定不同的端口，不同的目录和不同的php版本
  - 区别于location。location可以起到跳转啊，代理的作用，但是php版本是不能不同的（在一个server下的location们）
- 那么创建一个基本的网站就只需要在http中添加：
```
    server{
        listen 80; # 监听端口 可以这样：listen 443 ssl; 来使用https协议
        server_name 一个有意义的名字;

        location / {  # 指定网站访问根目录的时候的事情
            root 网站根目录的绝对路径;
            index 初始化脚本; # 通常是index.html index.htm index.php
        
        }
    }
```
