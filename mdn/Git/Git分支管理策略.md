# Git分支管理策略

## 一、git版本管理的挑战

gi是目前比较火的一款版本管理工具，但是在团队协作中依然面临相当大的问题与挑战

- 如何开始一个Feature开发，而不影响其他Feature
- 由于很容易创建新分支，分支多了如何管理，时间久了，如何知道每个分支是干什么的？
- 哪些分支已经合并到主干？
- 如何进行Release的管理？开始一个Release的时候如何冻结Feature,如何在Prepare Release的时候，开发人员可以继续开发新的功能？
- 生产线上代码出现Bug，如何快速修复？而且修复的代码要包含到开发人员的分支以及下一个Release？大部分开发人员使用Git一般使用三个甚至两个分支，一个是Master，一个是Develop，还有一个基于Develop的各种分支。在项目规模小的时候可以勉强支撑，但如果开发人员较多，而且项目周期过长就会出现各种问题。
- 在Git进行源码管理实践中，诞生了Git Flow，用于进行Git分支管理



## 二、主流分支策略简介

Git主流分支策略有三种：git Flow、GitHub Flow、TBD

Git Flow是应用最广的Git分支管理实践

GitHub Flow主要应用于GitHub代码托管工具中

https://guides.github.com/introduction/flow/

Trunk based development

TBD(Trunk-based development) ,是单主干的分支实践，在SVN中比较流行

https://trunkbaseddevelopment.com/alternative-branching-modes/

每个团队都应该根据团队自身和项目的特点来选择最合适的分支实践。首先是项目的版本发布周期。如果发布周期较长，则Git-Flow是最好的选择。Git-Flow可以很好的解决新功能开发、版本发布、生产系统维护等问题；如果发布周期较短，则TBD和和GitHub Flow都是不错的选择。GitHub Flow的特色在于集成了Pull Request和代码审查。如果项目已经使用GitHub,则GitHub Flow是最佳的选择。GitHub Flow和TBD对持续集成和自动化测试等基础设施有比较高的要求。



## 三、Git Flow简介

Git Flow是构建在Git 上的一个组织软件开发活动的源码管理模型，是一套使用Git进行源代码管理时的行为规范和简化部分Git操作的工具，是在Git上构建的一项源码管理最佳实践。

Git Flow通过利用Git创建和管理分支的能力，为每个分支设定具有特定的含义名称，并将软件生命周期中的各类活动归并到不同的分支上，实现了软件开发过程不同操作的相互隔离。

软件开发模型常见的有瀑布模型、跌XXX发膜性、敏捷开发模型等不同模型，每种模型有各自的应用场景。



Git Flow重点解决的是由于源代码在开发过程中的各种冲突导致开发活动混乱的问题。因此，Git Flow可以很好的与各种现有开发模型结合使用。



Git Flow分支模型资料如下：

http://nvie.com/posts/a-successful-git-branching-model/



## 四、Git Flow模型简介

### 1、Git Flow模型简介

![77d25cb01b3521393138460043911970](/Users/chenyanliang/Desktop/mdn/Git/77d25cb01b3521393138460043911970.png)

Git Flow模型中定义了主分支和辅助分支两类分支，其中主分支用于组织与软件开发、部署相关的活动；辅助分支组织用于解决特定的问题而进行的各种开发活动。



### 2、主分支

主分支是所有开发活动的核心分支。所有的开发活动产生的输出物最终都会反映到主分支的代码中。主分支分为master分支和develop分支。

![2主分支](/Users/chenyanliang/Desktop/mdn/Git/2主分支.png)

A、master分支只能从其他分支合并，不能在master分支直接修改。master分支上存放的是随时可供在生产环境中部署的代码（Productio  Ready  state）。每当开发到一定的阶段，产生一份新的可供部署的代码时，master分支上的代码会被更新。同时，每一次更新，最好添加对应的版本号标签（Tag）。

所有在Master分支上的Commit应该打Tag



B、develop分支

a、develop分支是保持当前开发最新成果的分支，一般会在此分支上进行晚间构建（Nightly Build）并执行自动化测试。

b、develop分支产生于master分支，并长期存在。

c、当一个版本功能开发完毕且通过测试功能稳定时，就会合并到master分支上，并打好带有相应版本号的tag

d、develop分支一般命名为develop，develop分支时主开发分支，包含所有要发布到下一个Release的代码，主要合并其他分支，比如Feature分支。



### 3、辅助分支

辅助分支是用于组织解决特定问题的各种软件开发活动的分支。辅助分支主要用于组织软件新功能的并行开发、简化新功能开发代码的跟踪、辅助完成版本发布工作以及对生产代码代码的缺陷进行紧急修复工作。辅助分支通常只会在有限的时间范围内存在。



辅助分支包括用于开发新功能时所使用的feature分支，用于辅助版本发布的release分支，用于修正生产代码中的缺陷的hotfix分支。



辅助分支都有固定的使用目的和分支操作限制。通过对分支的命名，定义了使用辅助分支的方法。

A、feature分支

feature分支使用规范：

a、可以从develop分支发起feature分支。

b、代码必须合并回develop分支。

c、feature分支的命名可以使用除master, develop,release-*，hotfix-*之外的任何名称。

feature分支（topic分支）通常在开发一项新的软件开发功能的时候使用，分支上的代码变更最终合并develop分支或者干脆被抛弃掉（例如实验性且效果不好的代码变更）。

一般而言，feature分支代码可以保存在开发者自己的代码库中而不强制提交到主代码库里。

Feature分支开发完成后，必须合并回Develop分支，合并完分支后一般会删除Feature分支，但也可以保留。

![3](/Users/chenyanliang/Desktop/mdn/Git/3.png)

B、release分支

release分支使用规范：

a、可以从develop分支派生；

b、必须合并回develop分支和master分支；

c、分支命名惯例：release-*；

release分支是为发布新的产品版本而设计的。在release分支上的代码允许做测试、bug修改、准备发布版本所需的各项说明信息（版本号、发布时间、编译时间等）。通过release分支上进行发布相关工作可以让develop分支空闲出来以接受新的feature分支上的代码提交，进入新的软件开发迭代周期。



当develop分支上的代码已经包含了所有即将发布的版本中所计划包含的软件功能，并且已通过所有的测试时，可以考虑准备创建release分支。而所有在当前即将发布的版本外的业务需求一定要确保不能混到release分支内（避免由此引入一些不可控的系统缺陷）。



成功的派生release分支并被赋予版本号后，develop分支就可以为下一个版本服务。版本号的命名可以依据项目定义的版本号命名规则进行。



发布release分支时，合并release到master和develop，同时在 master分支上打个tag记住release版本号，然后就可以删除release分支。

![4](/Users/chenyanliang/Desktop/mdn/Git/4.png)

c、hotfix分支

hotfix分支使用规范：

a、可以从master 分支派生

b、必须合并回master分支和develop分支

c、分支命名惯例：hot fix-*;

hotfix分支是计划外创建的，可以产生一个新的可供在生产环境部署的软件版本。

当生产环境中的软件遇到异常情况或者发现了严重到必须立即修复的软件缺陷时，就需要从master分支上指定的Tag版本派生hotfix分支来组织代码的紧急修复工作。优点是不会打断正在进行的develop分支的开发工作，能够让团队中负责新功能开发的人与负责代码紧急修复的人并行开展工作。



hotfix分支基于master分支创建，开发完后需要合并回master和develop分支，同时在 master上打一tag.

![5](/Users/chenyanliang/Desktop/mdn/Git/5.png)

## 五、Git Flow工程实践的意义

Git Flow开发模型从源代码管理角度对通常意义上的软件开发活动进行了约束，为软件开发提供了一个可供参考的管理模型。Git Flow开发模型让代码仓库保持整洁，让小组各个成员之间的开发相互隔离，能够有效避免处于开发状态中的代码相互影响而导致的效率低下和混乱。



为了简化使用Git Flow模型时Git指令的复杂性，nvie开发出了一套git增强指令集，可以运行于widows、Linux、unix、Mac操作系统下。

Https://github.com/nvie/gitflow



Git Flow工具是一套工具命令集，是对Git命令的封装，其命令如下：

```
git flow init
git flow feature start xxx
git flow feature finish xxx
git flow release start 0.1.xx
git flow release finish 0.1.xx
git flow hotfix start xxx
git flow hotfix finish xxx
```

使用Git Flow工具只需要两个命令即可完成Git Flow分支管理。如果使用Git命令，对开发者来说足够繁琐。



## 六、Git Flow分支管理应用示例

### 1、创建develop分支

```
git branch develop
git push -u origin develop
```



### 2、开始新的Feature开发

```
git checkout -b some-feature develop
#Optionally,push branch to origin
git push -u origin some-feature
git status
git add some-file
git commit
```



### 3、完成Feature

git  pull  origin develop

git  checkout  develop

git  merge  --no-ff  some-feature

git  push  origin  develop

git  branch  -d  some-feature

git   push  origin  --delete  some-feature



### 4、开始release

```
git checkout -b release-0.1.0 develop
# Optional: Bump version number, commit
# Prepare release, commit  
```

### 5、完成release

```
git checkout master
git merge --no-ff release-0.1.0
git push
git checkout develop
git merge --no-ff release-0.1.0
git push
git branch -d release-0.1.0
# If you pushed branch to origin:
git push origin --delete release-0.1.0   
git tag -a v0.1.0 master
git push --tags
```

### 6、开始hotfix

```
git checkout -b hotfix-0.1.1 master
```

### 7、完成hotfix

```
git checkout master
git merge --no-ff hotfix-0.1.1
git push
git checkout develop
git merge --no-ff hotfix-0.1.1
git push
git branch -d hotfix-0.1.1
git tag -a v0.1.1 master
git push --tags
```

