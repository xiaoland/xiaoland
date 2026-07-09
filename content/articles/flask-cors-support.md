---
title: '「教程」WEB服务端(Flask)实现跨域请求(CORS)支持'
description: '教程 Flask实现跨域请求支持 众所周知，跨域请求的主要责任在于服务器。 这是因为跨域请求时，服务器会先发送一个OPTIONS的请求，然后确认 是否允许跨域 和 有哪些标头是被允许的 注意！这里提到了两个要求，如果OPTIONS请求（预验请求）的响应头没有配置好，也是不行滴 @'
createdAt: '2023-07-01T14:47:00Z'
oldId: 238
oldUrl: 'https://blog.hadream.ltd/index.php/archives/238/'
categories: ['tutorial']
tags: ['CORS', 'flask']
---
- 众所周知，跨域请求的主要责任在于服务器。
  这是因为跨域请求时，服务器会先发送一个OPTIONS的请求，然后确认 是否允许跨域 和 有哪些标头是被允许的
- 注意！这里提到了两个要求，如果OPTIONS请求（预验请求）的响应头没有配置好，也是不行滴 @(chaiquan_mask) 
- CORS的相关文档可以看[跨源资源共享（CORS）][1]。但是我在这里指讲一般的情况，其它自行参考文档

### 实现CORS的根本
- 其实实现CORS的根本就是做好 对OPTIONS方法的支持 + 其响应头的配置


  [1]: https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS
