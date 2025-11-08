---
title: "DevOps 初尝试"
description: 在国内服务器上安装K3S，配置基于FluxCD的GitOps，并部署Postgres,Redis和两个Python应用。
---

## 前置知识

K8S 的控制平面组成：API Server,

K8S 的所有组件都是 Pod，Pod是最小部署单位，但不等同于一个容器。Pod里面可以有主容器和附属容器。

管理Pod的有 StatefulSet, Deployment等。

在 Deployment 之上的是 Service，Service将 Pod 暴露提供的服务暴露到集群内部。

而要让 Pod 对外提供服务，要在 Service 外面再套 Ingress。

## K3S

```bash
curl -sfL https://rancher-mirror.rancher.cn/k3s/k3s-install.sh | INSTALL_K3S_MIRROR=cn INSTALL_K3S_SKIP_SELINUX_RPM=true sh -s - \
--system-default-registry "registry.cn-hangzhou.aliyuncs.com"
```

通过 `kubectl` 查看

## Flux

Flux 是实现 GitOps 的关键，其会自动拉取给定 Git 仓库的更新并应用修改到 K8S 集群上（通过K8S的配置平面）。

> 循环依赖的问题怎么解决呢？这里有点脆弱说实话

### 安装

```bash
curl -s https://fluxcd.io/install.sh | sudo bash
```

该指令不会直接在 K8S 集群中安装 Flux 控制器，只是一个CLI安装。通过 `flux --version` 来验证安装。

要安装 Flux 到 K8S 集群，运行

```bash
flux install \
  --namespace=flux-system \
  --components=source-controller,kustomize-controller,helm-controller,notification-controller
```

可以清晰地看到，这将会创建一个命名空间，并在其中安装一系列控制器；
其中 `helm-controller` 是 Flux 用来识别和执行 `HelmRelease` 清单的控制器。如果你的 K8S 只用纯 YAML （不打算用任何 Helm Chart），可以不安装。

如果遇到 `"http://localhost:8080/api": dial tcp [::1]:8080: connect: connection refused` 之类的字样，意味着无法连接到你 K8S 集群的 API 服务器。此时如果你 `kubectl get nodes` 正常，那就只是没找对集群的位置，可能是因为你在 root 账户下，于是因为 root 用户默认的 kubeconfig 通常是空的，就找错了服务器。此时应该显示指定 kubeconfig: `--kubeconfig /etc/rancher/k3s/k3s.yaml`

可以使用 `kubectl -n flux-system get pods` 来校验安装。

### 连接 Git 仓库

Flux 会通过 SSH 的方式访问 Git 仓库，运行该指令来添加一个源

```bash
flux create source git flux-system \
  --url=ssh://git@your.githost.com/yourname/cluster-config.git \
  --branch=maind \
  --interval=1m
```

接着按照提示来配置好SSH Key

### 设置同步部署清单

## K3S 问题排查

常用指令：

```bash
kubectl get pods -n kube-system | grep ... 
kubectl get svc -n kube-system <service-name>
```

## Traefik

添加 `/var/lib/rancher/k3s/server/manifests/traefik-config.yaml` 配置一个 HelmChartConfig。

```bash
kubectl get svc -n kube-system traefik -o yaml | grep -A 5 ports:  // 1024 端口问题
ss -tulnp | grep traefik 
kubectl get helmchartconfig traefik -n kube-system -o yaml // 查看 helm 加载的内容
```

重新部署

```bash
kubectl -n kube-system scale deploy traefik --replicas 0
kubectl -n kube-system scale deploy traefik --replicas 1
```

### ACME

```yml
additionalArguments:
  - "--certificatesresolvers.letsencrypt.acme.email=lanzhijiang@foxmail.com"
  - "--certificatesresolvers.letsencrypt.acme.storage=/data/acme.json"
  - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
```

```bash
kubectl logs -n kube-system deploy/traefik | grep acme
```

或者检查

```bash
kubectl exec -it -n kube-system deploy/traefik -- cat /data/acme.json
```

```sh
# kubectl get svc -n kube-system traefik
NAME      TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)                      AGE
traefik   LoadBalancer   10.43.134.188   172.24.128.166   80:30341/TCP,443:30086/TCP   11h
```
