---
title: "Web 开发 CICD 实践「后端篇」其一"
finishedAt: 2026-06-23T21:49:45+08:00
description: "本篇是继 Web 开发 DevOps 实践「前端篇」的后端篇的其一（内容太多了，还不知道要写几篇）。"
status: "published"
---
本篇是继 [Web 开发 DevOps 实践「前端篇」](https://mp.weixin.qq.com/s?__biz=MzYzMjIwNTEyNg==&mid=2247483746&idx=1&sn=d4b208d054716050718621cdb1669bb4&scene=21#wechat_redirect)的后端篇的**其一**（内容太多了，还不知道要写几篇[旺柴]）。

## 基础知识与前言

相对于前端来说，后端的部署要复杂很多，因为还要包含数据库、运行时环境（如 Node，前端的运行时环境就是浏览器，不需要我们管），另外还有更多更复杂的环境变量、密钥管理。特别还有新版本 rollout 热切换：需先确保新版本启动无误，再将流量从旧版本切到新版本。

我们"搭一把"的后端是 Node（TypeScript + Hono + DrizzleORM），数据库是 PostgreSQL，有对象存储、后台任务的需求。

为了做到持续部署这样一个后端，我们会涉及：

- 准备 PostgreSQL （基于 Aliyun Serverless RDS）

- 如何将这样的一个后端、数据库部署到 Serverless 中，配置好自定义域名、HTTPS、多环境（staging, production）。
- 数据库迁移
- 解决 Serverless 没有固定 IP ，导致无法请求某些 API 的问题（比如微信登录限制 IP 白名单）。

本系列会一步步地讲清楚怎么做，并且解释清楚背后的原理，让我们开始吧！

## 准备数据库

数据库 Serverless 服务有 NeonDB, Supabase （更偏向 BaaS）以及 Heroku，但遗憾都在国外，于是还是选择阿里云。这里特别需要说明，不建议在严肃项目上使用阿里云的 RDS 服务，可以看 [草台班子唱大戏，阿里云RDS翻车记](https://mp.weixin.qq.com/s?__biz=MzU5ODAyNTM5Ng==&mid=2247488205&idx=1&sn=2c45a521d50a60e9644b95c974bb2949&scene=21#wechat_redirect) 做一些了解。不过我本人还在继续使用阿里云 RDS 的 Serverless 版 PostgreSQL ，因为这样成本更低（如图，也是伸缩实例）

![图 1](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/01.png)

现在我们来创建一个 Serverless PostgreSQL 实例，如图找到 RDS 控制台：

![图 2](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/02.png)

![图 3](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/03.png)

如图创建实例。记住选择的地域，后续后端要部署在一个地域，同一个可用区，同一个子网（VPC）内。

![图 4](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/04.png)

![图 5](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/05.png)

对于一天只有8小时左右有流量的服务来说，比买一个服务器并自己维护划算多了（最大 RCU，也就是 Compute Unit，不要调太高，除非你的服务有那么大的需求——但如果性能需求很大，就别用 RDS 了，性价比很差）

![图 6](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/06.png)

> 如果创建失败，可以换一个可用区试一下，它们太草台都没有做库存检查。

后续跟着界面引导继续走就行，应该会拿到账号密码。

![图 7](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/07.png)

创建成功之后，就可以进入实例，在如图的位置找到数据库连接地址，并且不建议开通外网地址。如果你需要进入数据库执行 SQL，做查询等，建议用他们的 DMS （Data Management Service，就是一个 Web 的数据库控制台） ，总之不建议以任何形式暴露你的数据库到公网。

![图 8](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/08.png)

另外阿里云官方也有文档可以参考

用同样的方法，继续创建另一个数据库实例。这样一个数据库实例用作 production，一个用于 staging。

## 部署后端服务

相信大家还记得 AWS Lambda，Serverless 最经典的用例就是后端服务、边缘函数。那么为了服务国内客户，我选择了阿里云函数计算（Function Computing）。FC 支持 Web 函数。说白了就是相当于用 Nginx 反代了你的后端服务，所以你不必为 FC 做代码上的适配，任何时候，你想部署到 VPS 上都可以。

![图 9](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/09.png)

如图你需要配置监听端口为你 HTTP Server 的监听端口，并且配置一个命令来启动你的后端（比如 `python app.py, node dist/index.js` ）。运行环境本质上就是一个安装了 NodeJS 的 Linux。

![图 10](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/10.png)

也有 layer 的概念，你完全可以按照 Docker 来理解 FC。

![图 11](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/11.png)

好的，现在我们回想一下，一般情况下我们是如何部署后端的？

1. 安装环境：NodeJS（用 nvm）
2. 安装依赖：node_modules （用 pnpm install）
3. 构建：如果你是 TypeScript，自然需要先构建为 JavaScript，一般用 tsup
4. 启动服务器：`node dist/index.js`
5. 管理服务启停与自动重启：pm2

正如我所说，FC 里面就是安装好 Node.JS 的 Debian。所以我们要做的就剩下安装依赖、构建、启动服务器。

### 创建函数

首先，当然得创建一个函数：

![图 12](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/12.png)

总之就是最省钱的配置（设置「最小实例数」为 0，就可以 scale-to-0）

![图 13](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/13.png)

自定义运行时我们选择 自定义运行时 NodeJS 22 (Debian11)

![图 14](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/14.png)

角色选择 AliyunFCDefaultRole 就行。不过如果你还要挂载 OSS，我建议你自定义一个角色：

![图 15](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/15.png)

（这里没有遵循最小授权，理论上应该限制在相应的资源组内）

网络配置部分注意打开「允许访问 VPC」，否则我们无法让后端通过内网的方式访问数据库和 OSS：

![图 16](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/16.png)

需要挂载 OSS 可以这样配置：

![图 17](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/17.png)

代码、环境变量等都保持默认即可，我们后续会通过声明式配置的方式从 CI 部署，不必在 Web Console 手动修改和维护。

创建好函数之后，我们先尝试将自己的代码打包为 Zip 并上传，然后用 `node dist/index.js` 来启动，会发现报依赖不存在的错误（除非你把 node_modules 也打包进去了）。此时我们就需要构建依赖层。

### 构建依赖层

函数实例是弹性的，会伸缩的，冷启动需要消耗时间，你打包的代码过大会导致函数实例冷启动慢。于是显然我们不能把 node_modules 这样一个可能高达 300M 的巨物打包到代码包里。

解决方案是构建自定义层（Layer）。这和 Docker 镜像的层是同一个概念。根据 FC 的文档，创建自定义层就是上传一个 Zip，Zip 中的内容会被解压到 /opt 下

![图 18](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/18.png)

具体来说，这样做：

![图 19](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/19.png)

如图框住的部分就是安装依赖，一般情况下，用 `pnpm install --prod .layer/nodejs` 就足够了，这样就会仅安装非开发依赖（devDependencies 比如 tsup, vitest 等）并且将 node_modules 安装到 .layer/nodejs 下面（这样就符合 FC Layer 的目录结构要求）。

不过我也进一步解释一下我这个命令中比较特殊的几个部分：

- `deploy` 的意义是：从 monorepo (pnpm workspace) 里抽取 `@partner-up-dev/backend` 这个 workspace package，复制它需要的文件，并在目标目录里安装一个隔离的、可搬运的 `node_modules`。重点在于会包括 workspace 依赖（internal package），安装进目标目录的独立 `node_modules`，目标目录可以直接复制到服务器运行。
- `--node-linker=hoisted` 的意义是：让生成出来的 `node_modules` 更接近 npm/Yarn Classic 的扁平结构，减少 pnpm 默认 symlink/virtual-store 布局在 serverless layer 里的不确定性。

node_modules 准备好之后，要做的就是压缩成 Zip 并发布（上传）自定义层。我建议通过阿里云的 serverless devs 工具（即下图框住的 s ）来完成（serverless devs 工具是 vendor-lock free 的，同样可以适用于 AWS，文档在 https://docs.serverless-devs.com/ ）

![图 20](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/20.png)

层的名字（`layer-name`）是 unique identifier，并且 publish 不会覆盖已经发布的层，而是自动累加版本号。发布成功后你可以在 FC 控制台里找到：

![图 21](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/21.png)

显然在 CI 中，构建并发布自定义层的 step 应仅在 lockfile 发生变化时才运行，否则每次提交就都会产生一个新的层版本了。

另外，即便你是在本地开发环境中使用 serverless devs ，建议也采用最小授权原则，用和 CI 一样的 AccessKey；为了避免和其它项目的 AccessKey 冲突，你可以在该项目的 Workspace-level VSCode Settings 中配置 terminal.integrated.env.linux 工作区级别的环境变量.

![图 22](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/22.png)

当然这仅限于 VSCode 内的 terminal，如果你想要进入某个目录自动启用某些环境变量，建议试试 mise 或者 direnv，这里就不过多赘述了。

好的，现在依赖安装好了，我们终于来到了启动服务器，也就是执行 `node dist/index.js`。然而我们不能直接配置 FC 的启动命令为 `node/dist/index.js` ：

![图 23](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/23.png)

而是写一个 shell 脚本，将 `/opt/nodejs/node_modules` 软链接到 `./node_modules` 之后再执行 `node/dist/index.js`

![图 24](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/24.png)

这很关键，因为 ESM 不识别 NODE_PATH （CJS 会），不做软链接最终会报依赖缺失的错误。

现在你真的可以测试一下了，你应该会得到 404 的错误：

![图 25](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/25.png)

### 接收请求

接下来，我们还要配置「触发器」，这样我们的函数（后端）才能处理 HTTP 请求。

![图 26](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/26.png)

不过其实当你选择用 Web 函数类型的时候，一个默认的 HTTP 触发器就已经创建好了，如果没有，按照图示操作添加一个就行。

![图 27](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/27.png)

默认情况下，应该选择「无需认证」，用户登录鉴权等交给我们的后端函数自己处理，而不是 FC 触发器处理。

这里「版本」说的是函数版本，每次发布就会产生一个新版本：

![图 28](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/28.png)

我们后续会介绍的后端部署 CI 中倒数第二步就是发布函数，紧接着就会将生产地址的 HTTP 触发器指向刚刚发布的版本，完成流量切换。

另外如果你希望做灰度发布，还可以利用「别名」：

![图 29](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/29.png)

如图可以很方便地实现版本灰度发布。不过我的规模根本没必要这么做，就算了。

![图 30](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/30.png)

但总之还是十分推荐创建一个 "production" 别名的，发布的时候更换别名指向的版本就好（HTTP 触发器指向别名而不是具体版本，如图）

![图 31](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/31.png)

### 自定义域名与 HTTPS

创建了 HTTP 触发器之后，你会拿到一个公网访问地址，显然我们会希望使用自己的域名，比如 `https://api.app.partner-up.cn` 。原理依旧是 CNAME，但我们不用手动维护，在 FC 的「域名管理」做配置就好。

自定义域名本质上是另一个 HTTP 触发器（所以其实你删掉刚刚创建的 HTTP 触发器也没有任何问题，而且阿里云也不推荐你把 HTTP 触发器给你的公网域名暴露到生产环境中，如果被攻击了，可能被封号）。

总之，找到「域名管理」创建自定义域名，跟着向导走就好。

![图 32](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/32.png)

注意看到本图，我配置了 /\* 的流量都走刚刚我创建的 FC 函数并指定了版本为 production 。那么相应的，staging 环境 （ https://test-api.app.parner-up.cn 就创建另一个自定义域名并路由到 LATEST 版本即可）。这也是为什么我推荐你创建别名而不是指向一个绝对版本的原因，这样不必发布一个版本就四处更新版本指向。

![图 33](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/33.png)

如图还可以直接配置 HTTPS，但没有 ESA 那样方便可以一键申请 Let's Encrypt 证书。我懒得自己又写一个 CI 用来续签并上传证书到阿里云，于是我们可以创建另一个函数定时运行，检查证书是否过期并且续签，创建/续签的证书会自动上传到阿里云 SSL 证书托管服务（免费的），然后就可以如图选择了：

![图 34](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/34.png)

如何部署这样一个自动续签证书的函数呢？很简单，社区上已经有人做好了，直接去 AppCenter 搜索“证书”然后一键部署即可：

![图 35](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/35.png)

![图 36](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/36.png)

部署区域建议和函数区域一致。之后你应该就会看到类似如图的两个函数：

![图 37](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/37.png)

进入 cert-generator 函数配置定时触发器，有几个域名要管理就配置几个触发器：

![图 38](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/38.png)

如图「触发消息」里面构造一个有 domainName 属性的 JSON Object ，值就是要申请 SSL 证书的域名，推荐设置在夜间运行，并且避免在周末运行（Don't push on Friday 😄）

![图 39](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/39.png)

然后你可以现在就去运行一次，并且查看「实时日志」

![图 40](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/40.png)

没有意外你就可以回到前面的「域名管理」配置相应的 SSL 证书了：

![图 41](https://r2.lanzhijiang.dev/web-dev-cicd-backend-part-1/41.png)

现在你可以去前端（ESA Page）配置后端地址环境变量为你刚刚配置好的域名啦！然后看看你的网站是不是功能正常了。

## 结语以及下篇预告

在接下来的几篇，我会继续介绍：

- 如何处理多环境的数据库迁移问题，读完后，你应该再也不用手动运行数据库模式（数据模型）、数据迁移，并且在开发、预演环境设置好测试数据方便人工验收
- 如何 setup 你的 GitHub CI 去自动化地完成数据库迁移、后端部署
- 在开启了 Scale-to-0 的阿里云函数上如何解决定时后台任务的需求
- Serverless 的函数实例是弹性伸缩的，所以没有固定 IP，那么如何解决某些 API （比如微信公众号）仅允许白名单内 IP 请求的问题呢？
