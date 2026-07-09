---
title: '「教程」flask生产环境部署'
description: '教程 flask生产环境部署 关于这个，网络上很多教程都抄来抄去，讲得东西不好好说明，弄的小白一头雾水 现在弄懂了，所以写一篇教程 我使用的是gunicorn结合supervisor的方案， 所以只能在linux上运行 关系图 ! 截屏2023 06 22 17.25.50.pn'
createdAt: '2023-06-22T09:18:00Z'
oldId: 232
oldUrl: 'https://blog.hadream.ltd/index.php/archives/232/'
categories: ['tutorial-it', 'tutorial']
tags: ['flask']
---
- 关于这个，网络上很多教程都抄来抄去，讲得东西不好好说明，弄的小白一头雾水
- 现在弄懂了，所以写一篇教程
- 我使用的是gunicorn结合supervisor的方案，**所以只能在linux上运行**

### 关系图
![截屏2023-06-22 17.25.50.png][1]截屏2023-06-22 17.25.50.png

### gunicorn
- 传统的，使用pip安装即可
- 配置gunicorn(.py):
```
import gevent.monkey # 这个gevent也是pip安装即可，是用于协程的

gevent.monkey.patch_all()
debug = False
loglevel = 'info'

bind = '0.0.0.0:6670' # 监听地址

log_path = "/Users/cm/Documents/coding/children_smart_home/aqara_bridge/data/logs"
# log文件基础路径

# 配置记录文件路径
pidfile = '%s/gunicorn.pid' % log_path
logfile = '%s/gunicorn.log' % log_path
accesslog = '/gunicorn_access.log' % log_path
errorlog = '/gunicorn_error.log' % log_path

daemon = 'false'
# 工作模式协程、默认 sync
worker_class = 'gevent'

workers = 3  # 进程数
threads = 20  # 每个进程最多线程数
worker_connections = 2000  # 最大并发

x_forwarded_for_header = 'X-FORWARDED-FOR'
```

### supervisor
- 不同的系统不一样，但是一般使用包管理器安装就可以了
- 配置supervisor(.conf)：
```
[program:项目名称]
command=gunicorn可执行文件的路径 -c gunicorn的配置文件 你的项目中flask启动文件:app
directory=flask项目地址
autorestart=truestdout_logfile=log路径/server_running.log
redirect_stderr=true
user=root  # 运行用户，一般不推荐root 
priority=999
```

### 启动
- 引入我们的项目：```supervisord -c myproject/supervisor_app.conf ```
- 启动项目：```sudo supervisorctl start 项目名称```
- 其他操作，比如停止、启动、重启（**不重新加载supervisor项目的配置文件**）就是对应的英文关键词就是了


  [1]: https://oss.lanzhijiang.dev/xiaoland/images/articles/flask-production-deployment/3392397338-dcca715b.png
