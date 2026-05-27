---
title: '「教程」Flask自签证书对SSL支持从而提供https'
description: '教程 Flask自签证书对SSL支持 本文章要点包括： Flask如何支持SSL从而提供https接口 如何自签SSL证书 如何自签SSL证书 参考 CSDN 自签SSL证书 1 。但是注意，密钥长度记得大于1024，不然flask不认 先安装好openssl CA证书创建 op'
createdAt: '2023-07-01T14:30:00Z'
oldId: 235
oldUrl: 'https://blog.hadream.ltd/index.php/archives/235/'
categories: ['tutorial-it', 'tutorial']
tags: ['flask', 'python', 'ssl']
---
# 教程-Flask自签证书对SSL支持
- 本文章要点包括：
  - Flask如何支持SSL从而提供https接口
  - 如何自签SSL证书

### 如何自签SSL证书
- 参考[CSDN-自签SSL证书][1]。但是注意，密钥长度记得大于1024，不然flask不认
- 先安装好openssl
#### CA证书创建
- `openssl genrsa -out ca-key.pem 2048  `
- `openssl req -new -out ca-req.csr -key ca-key.pem`
  - 老实根据提示填写就可以
- `openssl x509 -req -in ca-req.csr -out ca/ca-cert.pem -signkey ca-key.pem -days 3650`
#### Server证书创建
- `openssl genrsa -out server-key.pem 2048  `
- `openssl req -new -out server-req.csr -key server-key.pem  `
- `openssl x509 -req -in server-req.csr -out server-cert.pem -signkey server-key.pem -CA ca-cert.pem -CAkey ca-key.pem -CAcreateserial -days 3650`

### Flask开启SSL
- 先安装pyopenssl：`pip install pyopenssl`
- 然后在app.run添加一个参数: `ssl_context`
#### 图方便（但是使用者仅限于本机）
- 这个时候，你就把`ssl_context`填成`"adhoc"`
#### 本机以外的机器要请求
- 这个时候，要把刚刚生成的ca-cert.pem添加到系统信任证书当中，这个需要自行搜索不同系统的不同方法
- 接下来，`ssl_context=(<server-cert.pem>, <server-key.pem>)`。记得路径不要填错哦（按python启动脚本的位置算）


### 参考文章
- [CSDN-【Flask】在Flask中使用HTTPS][2]



  [1]: https://blog.csdn.net/yannanxiu/article/details/70670225
  [2]: https://blog.csdn.net/yannanxiu/article/details/70672744
