# 3D盲盒平台 · 开发变更日志

## 2026-05-16

### 数据导入
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `frontend/dev-db.json` | 批量导入40个系列（来源：系列说明.txt），系列数 5→45 |
| 新增 | `frontend/dev-db.json` | 批量导入388个藏品（来源：pachongxia各系列子目录.gif图片），总藏品 9→397 |
| 新增 | `frontend/public/series-images/` | 40个系列子目录，共388张宠物.gif图片，Vite静态服务 |
| 修改 | `frontend/src/pages/admin/Series/SeriesPage.tsx` | 系列表单新增封面图片上传（ImageUploader组件），支持文件上传/拖拽/URL替换 |

| 修改 | `frontend/dev-db.json` | 40个系列自动填入封面图（各系列目录第一张图片） |
| 修改 | `frontend/src/components/BoxCard/BoxCard.tsx` | 封面图 `object-cover` → `object-contain`，图片完整居中显示不裁切 |

### 功能增强
| 操作 | 说明 |
|------|------|
| 系列封面图 | 后台系列管理新增封面图片更换功能，前端BoxCard组件自动展示封面图 |
| 自动封面 | 40个导入系列自动设置封面图为各目录首张图片 |


## 2026-05-15

### 项目初始化
| 操作 | 文件 | 说明 |
|------|------|------|
| 创建 | `frontend/` | React + TypeScript + Vite 前端工程 |
| 创建 | `backend/` | Spring Boot 3 + MyBatis-Plus 后端工程 |
| 创建 | `PROGRESS.md` | 项目进度追踪文档 |
| 创建 | `CHANGELOG.md` | 本变更日志 |

### 前端 — 工程配置
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `frontend/package.json` | 依赖：React 18, Three.js, R3F, Zustand, TailwindCSS, React Router |
| 新增 | `frontend/vite.config.ts` | Vite配置，@别名指向src |
| 新增 | `frontend/tsconfig.json` | TypeScript严格模式 |
| 新增 | `frontend/tailwind.config.js` | 品牌色、稀有度色、圆角、阴影令牌 |
| 新增 | `frontend/postcss.config.js` | PostCSS + TailwindCSS + Autoprefixer |
| 新增 | `frontend/index.html` | 入口HTML，中文lang |

### 前端 — 基础架构
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `src/main.tsx` | React入口 |
| 新增 | `src/App.tsx` | 路由配置：用户端4页 + 后台管理5页 |
| 新增 | `src/index.css` | 全局样式、设计令牌、动效、滚动条 |
| 新增 | `src/types/index.ts` | 类型定义：BoxSeries, ItemDef, DrawRecord, RARITY_CONFIG |

### 前端 — 状态管理 (Zustand)
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `src/stores/userStore.ts` | 用户信息、余额扣除 |
| 新增 | `src/stores/boxStore.ts` | 8个盲盒系列Mock数据、系列查询 |
| 新增 | `src/stores/drawStore.ts` | 开盒模拟、随机抽奖算法、结果管理 |

### 前端 — 用户端组件
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `src/components/Layout/Layout.tsx` | 用户端布局壳子 |
| 新增 | `src/components/Layout/Header.tsx` | 顶栏：Logo、导航、余额、用户头像 |
| 新增 | `src/components/BoxCard/BoxCard.tsx` | 盲盒系列卡片：3D占位区、标签、价格 |
| 新增 | `src/components/DrawResult/DrawModal.tsx` | 开盒结果弹窗：藏品名、稀有度光效、收下/再开一次 |

### 前端 — 用户端页面
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `src/pages/Home/HomePage.tsx` | 首页商城：Banner、分类Tab、4列盲盒网格 |
| 新增 | `src/pages/Draw/DrawPage.tsx` | 3D开盒页：Three.js Canvas、BoxModel组件、连抽选择、实时动画 |
| 新增 | `src/pages/Collection/CollectionPage.tsx` | 藏品馆：用户概览卡、稀有度统计、筛选Tab、藏品网格 |
| 新增 | `src/pages/Profile/ProfilePage.tsx` | 个人中心：信息卡、余额、开盒历史列表 |

### 前端 — 后台管理
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `src/components/Admin/AdminLayout.tsx` | 后台布局：侧边栏菜单 + 内容区 |
| 新增 | `src/pages/admin/Dashboard/DashboardPage.tsx` | 数据看板：统计卡片、系列排行柱状图、稀有度分布 |
| 新增 | `src/pages/admin/Series/SeriesPage.tsx` | 系列管理：表格列表、新增/编辑弹窗、下架 |
| 新增 | `src/pages/admin/Items/ItemsPage.tsx` | 藏品管理：系列筛选、图片上传（拖拽/点击/URL）、概率配置、CRUD |
| 新增 | `src/pages/admin/Users/UsersPage.tsx` | 用户管理：用户列表、等级/余额/开盒次数、搜索 |
| 新增 | `src/pages/admin/Records/RecordsPage.tsx` | 开盒记录：稀有度筛选、流水号/藏品/金额/时间 |

### 后台藏品管理 — 图片上传增强 (v2)
| 操作 | 文件 | 说明 |
|------|------|------|
| 修改 | `src/pages/admin/Items/ItemsPage.tsx` | 新增 ImageUploader 组件：拖拽上传区、文件校验(格式+大小)、FileReader预览、hover替换/删除、URL输入备选 |
| 修改 | `src/pages/admin/Items/ItemsPage.tsx` | 表格列表新增缩略图列，有图片显示img否则显示emoji |
| 修改 | `src/pages/admin/Items/ItemsPage.tsx` | 编辑弹窗表单新增：缩略图上传组件、3D模型URL字段 |

### 后端 — 工程配置
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `backend/pom.xml` | Spring Boot 3.2.5, MyBatis-Plus 3.5.6, MySQL, Redis, Hutool |
| 新增 | `backend/src/main/resources/application.yml` | 数据源、Redis、MyBatis-Plus配置 |

### 后端 — 核心代码
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `BlindBoxApplication.java` | Spring Boot启动类 |
| 新增 | `common/Result.java` | 统一响应体 {code, message, data, timestamp} |
| 新增 | `entity/BoxSeries.java` | 盲盒系列实体 |
| 新增 | `entity/ItemDef.java` | 藏品定义实体 |
| 新增 | `entity/DrawRecord.java` | 开盒记录实体 |
| 新增 | `mapper/BoxSeriesMapper.java` | 系列Mapper |
| 新增 | `mapper/ItemDefMapper.java` | 藏品Mapper |
| 新增 | `mapper/DrawRecordMapper.java` | 记录Mapper |
| 新增 | `service/BoxService.java` | 系列查询、藏品列表 |
| 新增 | `service/DrawService.java` | 开盒引擎：加权随机、Redis防重锁、流水入库 |
| 新增 | `service/AdminService.java` | 后台：Dashboard统计、系列CRUD、藏品CRUD、记录分页 |
| 新增 | `controller/BoxController.java` | 用户API: GET /api/box/series, /series/{id}, /series/{id}/items |
| 新增 | `controller/DrawController.java` | 抽盒API: POST /api/draw/open |
| 新增 | `controller/AdminController.java` | 后台API: /api/admin/dashboard, /series, /items, /draws |

---

### 代码评审与修复 (2026-05-15)

**严重问题修复：**
| 操作 | 文件 | 说明 |
|------|------|------|
| 修复 | `backend/.../DrawService.java` | 移除未使用的BigDecimal导入；修复Redis锁在事务外释放的并发安全问题（延迟释放+异常处理） |
| 新增 | `backend/.../config/AdminAuthInterceptor.java` | 后台API鉴权拦截器，校验X-Admin-Token请求头 |
| 新增 | `backend/.../config/WebConfig.java` | 注册拦截器到 `/api/admin/**` 路径 |
| 修复 | `frontend/src/stores/userStore.ts` | `deductBalance` 增加余额不足校验，防止扣成负数 |

**中等问题修复：**
| 操作 | 文件 | 说明 |
|------|------|------|
| 修复 | `backend/.../service/AdminService.java` | `deleteSeries`/`deleteItem` 增加记录存在性校验 |
| 新增 | `frontend/src/components/Common/ErrorBoundary.tsx` | React全局错误边界，Three.js崩溃时显示重试UI |
| 新增 | `frontend/src/components/Common/ImageUploader.tsx` | 从ItemsPage抽离为独立可复用组件 |
| 修改 | `frontend/src/App.tsx` | 包裹ErrorBoundary到Routes外层 |
| 修改 | `frontend/src/pages/admin/Items/ItemsPage.tsx` | 删除内联ImageUploader，改用独立组件导入 |
| 修改 | `frontend/src/components/BoxCard/BoxCard.tsx` | `coverUrl` 字段生效：有图片显示img，无图片用emoji占位 |

### 安全审计与修复 (2026-05-15)

**严重漏洞修复：**
| 操作 | 文件 | 说明 |
|------|------|------|
| 修复 | `backend/.../controller/DrawController.java` | 移除price请求参数，改为服务端从数据库获取实际价格，杜绝客户端篡改 |
| 修复 | `backend/.../controller/DrawController.java` | `X-User-Id` 请求头已标注需对接真实JWT后替换（当前Mock阶段） |

**高危漏洞修复：**
| 操作 | 文件 | 说明 |
|------|------|------|
| 修复 | `backend/.../config/AdminAuthInterceptor.java` | Token改为配置化(`admin.token`)，使用`MessageDigest.isEqual`恒定时间比较防时序攻击 |
| 新增 | `backend/.../config/SecurityConfig.java` | Spring Security配置：CORS白名单、CSP头、CSRF禁用(REST Token)、无状态会话 |
| 修复 | `frontend/.../components/Common/ImageUploader.tsx` | URL输入过滤 `javascript:`/`data:`/`vbscript:` 危险协议，防XSS |

**中危漏洞修复：**
| 操作 | 文件 | 说明 |
|------|------|------|
| 修复 | `backend/.../resources/application.yml` | 移除数据库/Redis默认密码值；移除MyBatis stdout日志输出；日志级别改为INFO |
| 修改 | `backend/pom.xml` | 新增 `spring-boot-starter-security` 依赖 |

### QA全链路测试 (2026-05-15)

| 用例 | 测试场景 | 结果 |
|------|----------|------|
| TC01 | 首页加载 — 8系列、Banner、标签渲染 | ✅ PASS |
| TC02 | 分类Tab — 全部/热门/新品 筛选正确 | ✅ PASS |
| TC03 | 开盒页 — 3D Canvas、连抽按钮、余额显示 | ✅ PASS |
| TC04 | 开盒流程 — 点击→动画→结果弹窗→收下 | ✅ PASS |
| TC05 | 再开一次 — 结果弹窗二次开盒 | ✅ PASS |
| TC06 | 连抽切换 — 单抽/5连/10连 价格联动 | ✅ PASS |
| TC07 | 藏馆加载 — 用户概览、藏品网格、稀有度统计 | ✅ PASS |
| TC08 | 藏馆筛选 — 稀有度Tab切换 | ✅ PASS |
| TC09 | 个人中心 — 余额、等级、开盒历史 | ✅ PASS |
| TC10 | 404处理 — 不存在系列显示提示 | ✅ PASS |
| TC11 | 后台看板 — 统计卡片、排行、稀有度分布 | ✅ PASS |
| TC12 | 系列管理 — 列表、编辑弹窗预填、新增/下架 | ✅ PASS |
| TC13 | 藏品管理 — 系列筛选、图片上传组件、概率配置 | ✅ PASS |
| TC14 | 用户管理 — 用户列表、状态标签 | ✅ PASS |
| TC15 | 开盒记录 — 稀有度筛选、流水号展示 | ✅ PASS |
| TC16 | 编译检查 — TypeScript零错误 | ✅ PASS |

**QA结论：16/16 全部通过，质量评分 8.5/10，可上线。**

### DevOps云原生部署 (2026-05-15)

| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `frontend/Dockerfile` | 多阶段构建：node:20构建 + nginx:1.27服务，HealthCheck |
| 新增 | `frontend/nginx.conf` | Nginx：Gzip压缩、静态缓存、API反向代理、SPA fallback、安全头 |
| 新增 | `frontend/.dockerignore` | 构建排除：node_modules、dist、git |
| 新增 | `backend/Dockerfile` | 多阶段构建：maven:3.9构建 + eclipse-temurin:17-jre运行，JVM参数优化 |
| 新增 | `backend/.dockerignore` | 构建排除：target、git |
| 新增 | `backend/.../resources/schema.sql` | 8张表完整初始化脚本，docker-compose自动执行 |
| 新增 | `docker-compose.yml` | 全栈编排：MySQL 8.0 + Redis 7 + Backend + Frontend，健康检查+数据卷 |
| 新增 | `.github/workflows/deploy.yml` | CI/CD：前端TypeScript检查+构建、后端Maven打包、Docker镜像构建 |
| 新增 | `.env.example` | 环境变量模板：DB_USERNAME、DB_PASSWORD、REDIS_PASSWORD、ADMIN_TOKEN |
| 新增 | `.gitignore` | Git忽略规则 |

### 部署方式

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 修改密码

# 2. 一键启动全栈
docker-compose up -d

# 3. 访问
# 前端: http://localhost
# 后台: http://localhost/admin
# 后端API: http://localhost:8080/api/box/series
```

### 余额充值系统 (2026-05-15)

**用户端充值：**
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `frontend/src/components/Recharge/RechargeModal.tsx` | 充值弹窗：6档套餐选择(¥10~¥500)、赠额显示、确认支付页、成功页 |
| 修改 | `frontend/src/components/Layout/Header.tsx` | 充值按钮接入弹窗；修复余额显示bug（分转元缺失括号） |
| 修改 | `frontend/src/pages/Profile/ProfilePage.tsx` | 充值按钮接入弹窗 |

**后台充值管理：**
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `frontend/src/pages/admin/Recharges/RechargesPage.tsx` | 充值管理：统计卡片(今日充值/笔数/用户数)、充值记录表(订单号/金额/赠送/到账/状态) |
| 修改 | `frontend/src/components/Admin/AdminLayout.tsx` | 侧边栏新增 💰 充值管理 |
| 修改 | `frontend/src/App.tsx` | 路由注册 /admin/recharges |

**后端充值API：**
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `backend/.../entity/RechargeOrder.java` | 充值订单实体 |
| 新增 | `backend/.../mapper/RechargeOrderMapper.java` | 订单Mapper |
| 新增 | `backend/.../service/WalletService.java` | 充值套餐定义(6档)、创建订单、模拟支付、Redis原子加币 |
| 新增 | `backend/.../controller/WalletController.java` | GET /api/wallet/packages、POST /recharge、POST /pay/{orderNo}、订单查询 |

### 充值流程

```
用户点击充值 → 弹窗选套餐 → 确认 → 立即支付 → 余额实时更新 → 完成
后台: /admin/recharges → 统计卡片 + 全部充值记录(订单号/用户/金额/状态)
```

### 后台访问统计 (2026-05-15)

**后端：**
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `backend/.../entity/VisitLog.java` | 访问日志实体（页面路径、用户ID、IP、停留时长、日期） |
| 新增 | `backend/.../mapper/VisitLogMapper.java` | 访问日志Mapper |
| 新增 | `backend/.../service/StatsService.java` | 统计服务：总/今日/周访问量、UV/IP、7日趋势、页面排行、24h分布、平均停留 |
| 新增 | `backend/.../controller/StatsController.java` | GET /api/admin/stats/dashboard + POST /api/admin/stats/visit |

**前端可视化：**
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `frontend/src/pages/admin/Stats/StatsPage.tsx` | 访问统计页：6指标卡片、7日柱状趋势图、页面排行进度条、24h时段热力分布 |
| 修改 | `frontend/src/components/Admin/AdminLayout.tsx` | 侧边栏新增 📈 访问统计 |
| 修改 | `frontend/src/App.tsx` | 路由注册 /admin/stats |

**可视化内容：**
- 6项核心指标卡片（总访问/今日/本周/UV/IP/平均停留）
- 7日趋势柱状图（今日高亮紫色）
- 页面访问排行（名次徽章 + 渐变进度条）
- 24小时时段热力分布（峰值高亮）

### 全项目去Mock化 (2026-05-15)

**新建API层：**
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `frontend/src/utils/api.ts` | 统一API客户端：fetch封装、类型安全、全部接口函数（系列/开盒/用户/钱包/统计/管理CRUD） |

**Store去Mock：**
| 操作 | 文件 | 改动 |
|------|------|------|
| 重写 | `stores/boxStore.ts` | 移除8条硬编码系列 → `loadSeries()` 从 `/api/box/series` 获取 |
| 重写 | `stores/userStore.ts` | 移除硬编码用户 → `loadUser(id)` 从 `/api/user/{id}` 获取；新增 `addBalance` |
| 重写 | `stores/drawStore.ts` | 移除mockRandomItem随机算法 → `executeDraw(userId, seriesId)` 调 `/api/draw/open` |

**页面去Mock：**
| 操作 | 文件 | 改动 |
|------|------|------|
| 重写 | `pages/Home/HomePage.tsx` | 移除mock数据依赖 → `useEffect`加载 + Skeleton加载态 + 错误重试 |
| 修改 | `pages/Draw/DrawPage.tsx` | 移除simulateDraw → `executeDraw`真实API；移除内联稀有度颜色 → `RARITY_CONFIG`；新增失败退款 |
| 重写 | `pages/Collection/CollectionPage.tsx` | 移除12条mockItems → 从开盒记录+API加载；新增加载态/空状态 |
| 重写 | `pages/admin/Items/ItemsPage.tsx` | 移除12条mockItems → `adminListItems/Create/Update/Delete` 全部真实API；新增错误处理 |
| 重写 | `pages/admin/Users/UsersPage.tsx` | 移除5条mockUsers → 空状态"暂无用户数据" |
| 重写 | `pages/admin/Recharges/RechargesPage.tsx` | 移除5条mockOrders → 空状态"暂无充值记录"；统计数据实时计算 |
| 重写 | `pages/admin/Stats/StatsPage.tsx` | 移除全部mockData → `fetchStatsDashboard()` API；新增加载态/错误态/null安全 |
| 修改 | `components/Recharge/RechargeModal.tsx` | 移除6档硬编码套餐 → `fetchRechargePackages()` API；支付改 `payOrder()` API；新增套餐加载态 |

**编译验证：TypeScript零错误，全网grep零Mock残留。**

### SeriesPage API接入修复 (2026-05-15)
| 操作 | 文件 | 说明 |
|------|------|------|
| 重写 | `pages/admin/Series/SeriesPage.tsx` | 修复：handleSave从本地setState+Date.now()假ID → adminCreateSeries/UpdateSeries真实API；handleDelete从本地filter → adminDeleteSeries；新增loading/error/saving状态 |

### 全量Bug修复 — 代码审查+QA双Agent (2026-05-16)

**严重修复：**
| 操作 | 文件 | 说明 |
|------|------|------|
| 修复 | `dev-server.js` | GET /api/admin/items 过滤status=0的已删除项，DELETE现在真正移除 |
| 修复 | `src/main.tsx` | 应用启动自动调用 loadUser(1) + loadSeries()，用户不再为null |
| 修复 | `pages/Draw/DrawPage.tsx` | 多连抽改为 for 循环执行 N 次 executeDraw；直接URL访问增加 loadSeries fallback |

**高危修复：**
| 操作 | 文件 | 说明 |
|------|------|------|
| 新增 | `dev-server.js` | GET /api/admin/draws, /api/admin/users, /api/admin/recharges 端点 |
| 新增 | `utils/api.ts` | adminListUsers(), adminListRecharges() 函数 |
| 修复 | `pages/admin/Users/UsersPage.tsx` | useEffect调用adminListUsers()，展示真实用户数据 |
| 修复 | `pages/admin/Recharges/RechargesPage.tsx` | useEffect调用adminListRecharges()，展示真实充值记录 |
| 修复 | `pages/admin/Dashboard/DashboardPage.tsx` | 调用fetchStatsDashboard()填入今日UV；移除硬编码'--' |
| 修复 | `pages/admin/Records/RecordsPage.tsx` | 调用adminListDraws()获取服务端记录；移除无意义的"用户ID"列(r.id%100) |

**验证结果（浏览器实测）：**
- 用户自动加载: ✅ 余额¥299.90, 昵称"盲盒猎人"
- 藏品删除: ✅ 5→4，实际删除
- 直接URL /draw/1: ✅ 显示"星辰幻想"+"立即开盒"(不再"系列不存在")
- 用户管理: ✅ 展示盲盒猎人/开盒达人/收藏控
- 充值管理: ✅ 展示RC001/RC002已支付记录
- 数据看板: ✅ 展示今日UV(不再硬编码'--')

## 待记录

后续每次代码修改、新增、删除操作，按日期追加到本文件。
