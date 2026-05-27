---
title: '「总结」GoogleIOExtended2023线下沙龙总结'
description: '总结 GoogleIOExtended2023线下沙龙总结 这一次的讲座准备了很多丰富有趣的内容，跟NLP、LLM都有许多的关系，十分值得学习 关于ML 一般的ML过程 1. 数据收集与预处理 2. 模型架构设计与训练 3. 模型部署 4. 监控与持续优化 其中，谷歌坚持这一切都'
createdAt: '2023-07-20T16:08:00Z'
oldId: 248
oldUrl: 'https://blog.hadream.ltd/index.php/archives/248/'
categories: ['it-industry-share', 'summary']
tags: ['gdg']
---
# 总结-GoogleIOExtended2023线下沙龙总结
- 这一次的讲座准备了很多丰富有趣的内容，跟NLP、LLM都有许多的关系，十分值得学习

### 关于ML
#### 一般的ML过程
1. 数据收集与预处理
2. 模型架构设计与训练
3. 模型部署
4. 监控与持续优化
- 其中，谷歌坚持这一切都在ResponsibleAI的框架下运行
- ![](https://oss.lanzhijiang.dev/xiaoland/images/articles/google-io-extended-2023-recap/7f1bef6dc3e85e05317555a6c179-beaec800.jpg)


#### Google在ML方面的支持
- kaggle：数据收集与处理
  - 数据增强：数据来之不易，可以利用AI来增加样本量
  - 现成数据
- keras-cv：物体检测与识别 支持nlp
- jax：科研 写paper 模型转化
- re-tensorflow：tensorflow似乎经过了优化，并没有那么难上手了
- tensorflow-js webgpu：部署模型

### 关于LLM：
- Google发布了新版的PaLM，对外开放了以下几种API
  - chat（对话模式，重视上下文）
  - text（单轮对话）
  - embedding（nlp 词向量化）
- 提示词工程（递进发展）
  - Prompting
  - In-Context Learning：通过少数几个例子，让模型在不更新参数的前提下解决任务
    - ![](https://oss.lanzhijiang.dev/xiaoland/images/articles/google-io-extended-2023-recap/7ee8ac00cca3e9d73fa925671a44-7ea6f873.jpg)
  - Chain of thought 
- 数据生成
- soft-tuning reverse-prompt 
- safe-and-responsible：模型边界（bias）  
- fine-tune：微调以快速应用训练好的模型用于解决实际任务、更好地解决实际任务
- 多样性覆盖是解决bias的一种办法（数据生成）
- prompt
  - user-prompt
  - initial-prompt
- 借助measure-harms（输入与输出两面检测）来改进模型的安全性
  - ![](https://oss.lanzhijiang.dev/xiaoland/images/articles/google-io-extended-2023-recap/a5e0679701ba3735d92f8e5e9ae5-eff83d6f.jpg)

### LLM下的NLP：
- NLP的主要任务：
  - 整理（分类，抽取特征、块）
    - 分类（通用）
    - 序列标注：分词 时间抽取 实体识别 
  - 生成自然语言
    - 翻译
    - 语音识别（也算，自然语言不仅仅包括文本形式） 
    - 创造
  - ![](https://oss.lanzhijiang.dev/xiaoland/images/articles/google-io-extended-2023-recap/9fa808758aca0ffdd2c8f7979866-8963db29.jpg)
- 数据标注决定于输入与输出（任务要求与原始数据）
- 从前：预训练模型+微调
- 语言模型可以模仿（包括思维模式：假推理？什么是推理） 
  - 指令学习
  - 人在回路：高质量标注以微调
- 从前：encoder（解析）与decoder（生成）结构的模型，而ChatGPT是纯decoder的模型
- 抽象问题也是很重要的，由场景而来
  - 写prompt现在是在gpt系中代替了抽象问题的方法
- autoGPT的运作方式值得参考（模型掌握得比人多，比人细）（买一台电脑）（削弱掉人的规划作用）

### 谷歌云：
- anycast取代dns分流
- 谷歌云翻译api
- 谷歌地图api
- vertexai帮助构建LLM构建
- embbedingapi，matching
- codey
- imagen 
- cloud spanner
- cloud bigtable
- big query(warehouse)
- google analystics(数据收集，标记）
