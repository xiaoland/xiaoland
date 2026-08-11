---
title: "Web 开发 DevOps 实践「前端篇」"
description: "在 AI 时代，代码编写的速度越来越快，部署作为开发流程的重要一环，自然不能拖后腿。本文会介绍如何将一个前后端分离的 Web 项目基于 GitHub 和阿里云服务实现 staging, production 环境的持续部署。"
finishedAt: 2026-06-19T21:33:17+08:00
status: "published"
---
在 AI Coding 时代，代码编写的速度越来越快，CI/CD 以及多环境隔离（也就是 DevOps 的主要内容）可以帮助我们快速 review AI 的产出，提升部署的速度，避免人为造成的错误。

本文是我"搭一把"创业过程中总结出来的经验，会介绍：

如何将一个前后端分离的 Web 项目，

做本地开发、上线预演和生产三个环境拆分，

和基于 GitHub CI + 阿里云 的 Serverless 化持续部署。

本文为「前端篇」，后端篇后续会补上，欢迎关注我！

---

## 基础背景介绍

选择 Serverless 而不是传统的购买一台云服务器来部署服务，是因为“搭一把”还处于早期阶段、成本有限。另外考虑到主要面向国内用户，我便选择了阿里云的系列 serverless 服务，本文章也会围绕 Aliyun ESA, FC, OSS, RDS 展开，而不是 Cloudfalre, Heroku, FlyIO 等。

首先，网页的“前端”其实本质上就是一组静态资源（HTML, CSS, JS）。传统的做法是运行一个 Web 服务器，比如 Nginx, Apache, Caddy 等，部署就是将站点的 nginx.conf, dist （构建产物） 通过 SSH 上传到服务器的指定目录下。

这样很不错，但正如我所说，你得自己维护这台服务器，照顾从安全到进程的方方面面，而且还有 SSL 证书。serverless 就正如字面意思，“没有服务器”，可以省去这些繁琐的事情，专心用那一个 Nginx 服务就好，不用关心基建。那么 serverless 解决方案有 Cloudflare Pages, GitHub Pages 这样的产品。在国内，那就是 Aliyun ESA 或者腾讯云 EdgeOne。我个人选择的是 Aliyun ESA，个人账号免费。

## 开始

首先，进入 Aliyun ESA，创建一个 Pages（这里的函数和 FC 的区别在于，这个函数更加简化，不支持自定义运行时，不支持 server 式部署）

![图 1](https://r2.lanzhijiang.dev/web-dev-devops-frontend/01.png)

![图 2](https://r2.lanzhijiang.dev/web-dev-devops-frontend/02.png)

选择一个适合你的选项就好，这边我们先选择从 GitHub 导入。对于这个创建方式，ESA 还会自动配置好 Pull 式部署（ ESA 从代码库拉取代码进行部署，而不是代码库上的 CI 推送构建好的部署包推送到 ESA）。这边后续会说明如何配置 Push 式部署，从而更完整地实现 IaC (Infrastructure as Code)。

接下来进入配置环节，参数有这些：

![图 3](https://r2.lanzhijiang.dev/web-dev-devops-frontend/03.png)

我先前已经完成了部署并且改成了 Push 模式，所以在这里我只能简单说明一下各个参数，没有相应的截图：

- 生产分支：比如 main, master 一般会作为你的生产分支，则该分支上有 commit 时，ESA 会自动 pull 该分支的代码并部署，然后发布到生产环境（每个 ESA Pages 有 staging 和 production 两个环境）
- 非生产分支构建：开启后，ESA 还会拉取生产分支以外的分支代码（应该限定了有 open PR 的分支）进行部署，但我不确定是会部署到 staging 还是像 Cloudflare Pages 那样每个分支可以有一个部署，这对于 PR Review 的时候还是挺有帮助的
- 安装命令：用于安装依赖的命令，我设置的是 `pnpm install --frozen-lockfile`，因为我是 pnpm workspace，需要用 pnpm 才能正常安装依赖，并且 ESA 是支持 pnpm 的，而且特别建议在部署时按照 lockfile 安装，这样可以避免部署时和本地开发时依赖有版本差异（因为默认 patch version 区别是可以接受的），另外这就意味着你的 git 得将 pnpm-lock.yaml 带上
- 构建命令：安装好依赖之后就是构建，构建命令一般是运行你项目的一个 script （写在 package.json 的那个），我的是 `pnpm run --filter frontend build`
- 静态资源目录是你构建后产物的位置，一般是 `/dist`
- 环境变量、Node.js 版本根据你的实际情况填写就行

如果你的前端是 CSR （Client-side rendering） SPA (Single-page application)，你需要在 esa.jsonc 中进行如下的配置（esa.jsonc 放在你填写的根目录底下）

![图 4](https://r2.lanzhijiang.dev/web-dev-devops-frontend/04.png)

否则从非根路径，比如 `/me` 进入你的应用时就会遇到 404 错误。这点在 Nginx / Apache 上部署也是一样的，Aliyun ESA 本质上就是把 Nginx + CDN 包装给你作为一个服务。

现在，你的 Pages 应该部署好了，可以点击如图的按钮访问：

![图 5](https://r2.lanzhijiang.dev/web-dev-devops-frontend/05.png)

## 自定义域名以及 HTTPS

但这个地址通常是阿里云的域名，你肯定希望用一个你自己的域名，比如我的就是 partner-up.cn 。那么如何配置呢？

![图 6](https://r2.lanzhijiang.dev/web-dev-devops-frontend/06.png)

如上图，找到你 Pages 的「域名」选项卡，然后就可以看到域名绑定这个选项，并且注意我框出来「目前仅支持添加激活站点域名」。这段提示的意思是，你得先把你的域名交给 Aliyun ESA 托管，具体这样做：

![图 7](https://r2.lanzhijiang.dev/web-dev-devops-frontend/07.png)

然后就跟着指引，完成站点接入。我的域名是在阿里云注册，DNS 也在阿里云，所以接入比较快速直接。我接入的方式是 CNAME，也就是由 Aliyun ESA 操作 DNS 记录，配置相关的解析记录。比如 `app.partner-up.cn` 这样的域名绑定到我的 ESA Page ，本质上就是添加一条 CNAME 记录指向 ESA 自己内部分配的一个域名，你可以在 DNS 解析中观察到：

![图 8](https://r2.lanzhijiang.dev/web-dev-devops-frontend/08.png)

注意到我这里前端和后端有分离的域名，而不是传统的将后端挂载到 /api 下，其实是我懒得去进一步配置，这样分开来也方便一点，结构也清晰。不过如果你想要用 /api ，可以使用如下图的「路由」功能，将除了 /api 以外的路径都导到 ESA Page，其余的就会去源站（虽然我没搞懂它这个源站是哪来的）

![图 9](https://r2.lanzhijiang.dev/web-dev-devops-frontend/09.png)

绑定域名之后，我们还得处理 SSL ，也就是 HTTPS 的问题。ESA 对此已经有了集成，如下图点几下就好：

![图 10](https://r2.lanzhijiang.dev/web-dev-devops-frontend/10.png)

![图 11](https://r2.lanzhijiang.dev/web-dev-devops-frontend/11.png)

所谓免费证书，其实就是 Let's Encrypt ，ESA 会帮你自动申请自动续期，完全不用你操心。看你能不能接受，反正我完全无所谓。

![图 12](https://r2.lanzhijiang.dev/web-dev-devops-frontend/12.png)

## 多环境

我前面有说 ESA Page 本身就支持多环境部署，如图中的解释，需要配置本地 hosts 文件，这不太方便，特别是对我这种目标客户在微信生态，我需要频繁使用微信真机进行测试的情况来说。

![图 13](https://r2.lanzhijiang.dev/web-dev-devops-frontend/13.png)

所以在这里我会推荐你分别创建两个 ESA Page：一个用于 staging 环境，一个用于 production 环境，两个 Page 分别绑定不同的域名，也有不同的环境变量（特别是后端地址不同）

![图 14](https://r2.lanzhijiang.dev/web-dev-devops-frontend/14.png)

![图 15](https://r2.lanzhijiang.dev/web-dev-devops-frontend/15.png)

## Push 式部署

到这里，你的前端已经部署好了，但我们要做的是 Continuous Deployment —— 但正如我前面所说，如果你是通过连接到 GitHub 仓库完成 ESA Page 的创建，那么 CD 其实也准备好了（Pull 模式）。如果你想进一步走到 Push 模式，请接着往下看。

思路很简单，ESA 官方提供了 ESA Cli ，专门用于在 CI 中运行，上传你构建好的前端产物到 ESA Page，这里直接贴出 GitHub workflow，你可以适当地调整 `on` 字段来设置部署触发的条件

```yaml
name: Deploy Frontend to Aliyun ESA
on:
  workflow_dispatch:
  push:
    branches:
      - master
      - develop
    paths:
      - ".node-version"
      - ".npmrc"
      - "apps/frontend/**"
      - "apps/backend/src/**"
      - ".github/workflows/frontend-esa-deploy.yml"
      - "package.json"
      - "pnpm-lock.yaml"
      - "scripts/ci/esa/**"
      - "vitest.config.ts"
permissions:
  contents: write
  issues: write
  packages: read
  pull-requests: write

# 避免多个 Run 同时进行
concurrency:
  group: frontend-esa-deploy
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    environment: ${{ github.ref == 'refs/heads/master' && 'production' || 'staging' }}
    env:
      ALIYUN_ESA_PROJECT_NAME: ${{ vars.ALIYUN_ESA_PROJECT_NAME || 'partner-up-mvp-ha' }}
      ALIYUN_ESA_ENVIRONMENT: production
      ALIYUN_ESA_DEPLOY_DESCRIPTION: github:${{ github.sha }}
      ALIBABA_CLOUD_ACCESS_KEY_ID: ${{ secrets.ALIBABA_CLOUD_ACCESS_KEY_ID }}
      ALIBABA_CLOUD_ACCESS_KEY_SECRET: ${{ secrets.ALIBABA_CLOUD_ACCESS_KEY_SECRET }}
    steps:
      - name: Checkout
        uses: actions/checkout@v6
      - name: Setup pnpm
        uses: pnpm/action-setup@v6
      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version-file: .node-version
          cache: pnpm
      - name: Deploy frontend through repository script
        run: bash scripts/ci/esa/deploy_frontend.sh
```

这边为了方便本地调试 CI，没有在 workflow 中直接写命令，而是做成一个 script （workflow 中我的路径是 scripts/ci/esa/deploy_frontend.sh 注意自己修改） ，内容如下

```bash
#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
ci_esa_cd_repo_root
workspace_dependencies_installed=false
install_workspace_dependencies() {
  if [ "$workspace_dependencies_installed" = "true" ]; then
    return 0
  fi
  ci_esa_run pnpm install --frozen-lockfile
  workspace_dependencies_installed=true
}
validate_environment() {
  echo "+ bash scripts/ci/esa/validate_frontend_env.sh"
  bash scripts/ci/esa/validate_frontend_env.sh
}
validate_frontend() {
  install_workspace_dependencies
  ci_esa_run pnpm --filter @partner-up-dev/frontend lint:tokens:strict
  ci_esa_run pnpm test:unit:frontend
}
build_frontend() {
  install_workspace_dependencies
  ci_esa_run pnpm --filter @partner-up-dev/frontend build
}
deploy_frontend() {
  local project_name="${ALIYUN_ESA_PROJECT_NAME:-partner-up-mvp-ha}"
  local environment="${ALIYUN_ESA_ENVIRONMENT:-$(ci_esa_environment)}"
  local description="${ALIYUN_ESA_DEPLOY_DESCRIPTION:-github:${GITHUB_SHA:-local}}"
  export ESA_ACCESS_KEY_ID="$ALIBABA_CLOUD_ACCESS_KEY_ID"
  export ESA_ACCESS_KEY_SECRET="$ALIBABA_CLOUD_ACCESS_KEY_SECRET"
  ci_esa_run npx --yes esa-cli@1.0.10 login
  ci_esa_run npx --yes esa-cli@1.0.10 deploy \
    --name "$project_name" \
    --assets ./dist \
    --environment "$environment" \
    --description "$description"
}
main() {
  validate_environment
  validate_frontend
  build_frontend
  cd apps/frontend
  deploy_frontend
}
main "$@"
```

显然这个 script 有很多我项目特有的内容，比如 workspace dependency ensure, token lint, unit test 你可以放心删除。

重点关注 32 到 37 行即可，就是这里使用了 ESA Cli 完成部署。可以注意到有 ESA_ACCESS_KEY_ID 和 ESA_ACCESS_KEY_SECRET 这两个环境变量，它们是 ESA Cli 的操作凭证，你可以通过如下步骤获取：

![图 16](https://r2.lanzhijiang.dev/web-dev-devops-frontend/16.png)

AccessKey 就类似于你的账号密码，是鉴权凭证。为了最小化授权，这里建议你创建一个仅有 ESA 权限的 RAM 帐号，并使用该 RAM 帐号的 AccessKey 而不是你主帐号的 AccessKey （否则一旦 AccessKey 泄漏，你帐号里的其它资源可能受到影响，受害面更大）

![图 17](https://r2.lanzhijiang.dev/web-dev-devops-frontend/17.png)

按引导填写（注意禁止该帐号登录控制台），创建帐号之后，添加 AliyunESAFullAccess 这个授权。

![图 18](https://r2.lanzhijiang.dev/web-dev-devops-frontend/18.png)

资源范围也不建议选择账号范围，而是特定的资源组（你可以把 ESA Page 加入到一个资源组中）。

![图 19](https://r2.lanzhijiang.dev/web-dev-devops-frontend/19.png)

现在，如图在「凭证管理」可以创建 AccessKey 。获取到的 AccessKey ID, AccessKey Secret 就保存到你的 GitHub Repostiory 环境配置中，如图：

![图 20](https://r2.lanzhijiang.dev/web-dev-devops-frontend/20.png)

如果你还没有 GitHub Environment ，请创建，分别是 staging 和 production ，对应我先前说的预演环境和生产环境。然后你就可以在里面配置 secrets 和 variables （显然 AccessKey 是 secrets ）。关于 GitHub Environment 是如何生效的，可以看到上面 workflow 的这一行：

```yaml
environment: ${{ github.ref == 'refs/heads/master' && 'production' || 'staging' }}
```

你可以根据自己的实际分支名称、环境名称来修改。另外，其实我没有把 AccessKey 放在 GitHub Environment 中，而是放在了如图的 Repostiory Secrets 中，这是无关环境，整个仓库所有的 workflow 都可以使用这个 secret，我这么做是因为我没有按照环境去区分 AccessKey，你可以且被鼓励去这么做。

![图 21](https://r2.lanzhijiang.dev/web-dev-devops-frontend/21.png)

现在，试试做一些开发修改，然后推送到你的 develop 或 master 分支，或者开启一些 PR，看看你的 GitHub Actions 是否正常运行了？

![图 22](https://r2.lanzhijiang.dev/web-dev-devops-frontend/22.png)

如果成功，恭喜你！如果不成功，就请查看具体的错误并按照提示信息去排查问题，反复调试直到通过。别担心，你会有很多 fix ci commit 的 😁

---

感谢您的阅读，我们下期「后端篇」见，我会介绍如何将『Node + Hono + DrizzleORM + PostgreSQL + 后台定时任务 + 对象存储』这样一个复杂的后端实现多环境持续部署。
