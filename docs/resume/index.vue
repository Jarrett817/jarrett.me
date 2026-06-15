<template>
  <div class="resume-container color-#3c3c43">
    <article>
      <n-button v-if="isMobile" quaternary class="hidden-when-print px-0" @click="router.go('/')">
        <n-icon size="20"><ArrowLeft /></n-icon>
        首页
      </n-button>
      <section class="bio">
        <div class="flex-1">
          <h1>王俊然</h1>
          <p class="summary">
            前端开发 · 5 年 · 工程化 / 微前端 / AI Agent 辅助研发<br />
            擅长复杂存量迁移、产品提升、构建优化与可复用组件沉淀
          </p>
          <p class="bio-meta">
            男 <span class="column-line">|</span> 27岁
            <span class="column-line">|</span>
            本科 <span class="column-line">|</span> 中共党员
          </p>
          <p class="bio-contact">
            电话：<a href="tel:13516724981">135-1672-4981</a>
            <span class="column-line">|</span> 微信：13867223154
            <span class="column-line">|</span> 邮箱：<a href="mailto:jrwang0817@163.com"
              >jrwang0817@163.com</a
            >
            <span class="column-line">|</span> GitHub：<a
              href="https://github.com/Jarrett817"
              target="_blank"
              >github.com/Jarrett817</a
            >
          </p>
        </div>
        <img src="./images/photo.jpeg" alt="证件照" />
      </section>
      <div class="head-line"></div>
      <section class="skills">
        <h2>技能</h2>
        <div class="skills-columns">
          <div class="skills-group">
            <h4 class="skills-group-title">技术栈</h4>
            <ul>
              <li
                ><strong>熟练：</strong>Vue2/3、React、Next.js、微信小程序；TypeScript / JavaScript
                (ES6+)</li
              >
              <li><strong>熟练：</strong>Web工程化、小程序工程化及调优</li>
              <li>注重响应式与交互体验，具备性能治理与产品化落地经验</li>
              <li><strong>熟悉：</strong>Node.js、ThinkJS、Hono；有项目落地经验</li>
              <li><strong>熟悉：</strong>MySQL、Redis</li>
            </ul>
          </div>
          <div class="skills-group">
            <h4 class="skills-group-title">工程化 & AI</h4>
            <ul>
              <li
                ><strong>熟练：</strong>Webpack / Vite 构建调优与自定义插件；Bun
                依赖管理与构建提速；Zod 运行时接口校验</li
              >
              <li
                ><strong>熟悉：</strong>Qiankun 微前端落地（多应用嵌套、zIndex
                层级、跨应用样式隔离）</li
              >
              <li
                ><strong>熟悉：</strong>AI Agent 辅助研发，理解 Agent 原理与架构；熟练使用 Claude /
                Cursor / Kiro，以 rules/skills 约束交付；熟悉 Dify 工作流搭建</li
              >
            </ul>
          </div>
        </div>
      </section>
      <div class="split-line"></div>
      <section class="internExperience">
        <h2>工作经历</h2>
        <ol>
          <li>
            <header>
              <h4>杭州萤石网络股份有限公司 | 中台研发部 | 前端开发</h4>
              <h4>2024.05-至今</h4>
            </header>
            <span class="field-label">主要工作：</span>
            <ul>
              <li>负责官方商城小程序、商家后台等核心业务迭代，主导性能优化与工程化改造</li>
              <li
                >独立承担 AIGC 视频平台、智能客服、Skill 技能市场、存储卡防伪验真等 0→1
                项目的前端或全栈交付</li
              >
            </ul>
            <span class="field-label">主要业绩：</span>
            <ul>
              <li>
                <strong>业务与性能：</strong
                >主导官方商城、商家后台迭代；单季度小程序冷启动性能提升<span class="metric"
                  >40%</span
                >（3000ms→1800ms）
              </li>
              <li>
                <strong>工程落地：</strong>主导小程序构建体系升级（wepy→webpack
                混合打包），实现业务零影响、开发者零感知迁移
              </li>
              <li>
                <strong>AI 提效：</strong>使用 Coding Agent + rules/skills
                约束研发、自测流程，完成前端 0→1 落地
              </li>
              <li>获评新人之星、2025 年度良好</li>
            </ul>
          </li>
          <li>
            <header>
              <h4>每日互动股份有限公司 | 治数平台部 | 前端开发</h4>
              <h4>2020.11-2023.12</h4>
            </header>
            <span class="field-label">主要工作：</span>
            <ul>
              <li
                >2020.11
                实习入职，2021.07转正；主导标签平台前端、人口数据管理平台开发，同时负责建模平台、机器学习平台、基座平台的开发</li
              >
              <li
                >公共技术沉淀：负责部分公共物料、公共组件开发、技术方案输出，主导公共文档编写、维护
              </li>
            </ul>
            <span class="field-label">主要业绩：</span>
            <ul>
              <li>
                <strong>业务组件输出：</strong
                >开发微前端架构下页面多级跳转路径返回自动化处理插件，封装横向树组件应用于可视化 SQL
                配置场景，被多个业务线使用
              </li>
              <li>
                <strong>技术方案输出：</strong>解决微前端架构下多应用嵌套的组件库 zIndex
                层级管理问题，解决跨应用样式冲突
              </li>
              <li>
                <strong>团队文档沉淀：</strong
                >编写微前端架构下主、子应用从环境配置、开发规范的全流程开发文档，降低新人上手成本；梳理换肤方案及微前端下的应用嵌套方案
              </li>
              <li>2021 年 P6，2023 年晋升 P7</li>
            </ul>
          </li>
        </ol>
      </section>
      <div class="split-line"></div>
      <section class="projects">
        <h2>项目经历</h2>
        <ol>
          <li>
            <h4>AIGC 视频创作平台</h4>
            <span class="field-label">项目描述：</span>
            <p
              >支持无限画布创作的 AIGC 视频平台，核心能力对标 LiblibTV 类产品。技术栈：<span
                class="tech-stack"
                >React 19 / React Router v7 / Flowgram / TanStack Query / Zod / Vite / Bun</span
              >
            </p>
            <span class="field-label">个人产出：</span>
            <ul>
              <li
                ><strong>无限画布：</strong>基于 Flowgram
                自由布局引擎搭建编辑器，封装视频/图片/分镜表/裂变表 4
                类节点，支持缩放、Minimap、Undo/Redo 及入边数量校验</li
              >
              <li
                ><strong>状态持久化：</strong>画布变更 600ms
                防抖提交，版本号乐观锁配合队列串行保存，避免并发编辑覆盖</li
              >
              <li
                ><strong>性能优化：</strong>视口门控延迟卸载离屏节点重内容，分镜表 TanStack Virtual
                虚拟滚动，支撑单画布多视频节点与多分镜表流畅交互</li
              >
              <li
                ><strong>AI 工作流：</strong>打通 Qwen
                视频解析异步任务，拉片结果写入画布分镜表节点；支持按角色/产品/场景维度裂变批量生成；集成
                ali-oss 大文件分片上传</li
              >
            </ul>
          </li>
          <li>
            <h4>智能客服</h4>
            <span class="field-label">项目描述：</span>
            <p
              >萤石服务中心 AI 问答，基于 Dify
              工作流与知识库检索，覆盖说明书、安装视频等多入口场景。技术栈：<span class="tech-stack"
                >React 19 / ThinkJS / TypeScript / Dify / SSE / TanStack Query / Zod</span
              >
            </p>
            <span class="field-label">个人产出：</span>
            <ul>
              <li
                ><strong>全栈交付：</strong>独立负责 ai-service 前端与 ThinkJS 转发层，封装
                <code>/dify/proxy</code> 统一代理 Dify 工作流流式对话，API Key
                后端注入，前端零密钥暴露</li
              >
              <li
                ><strong>流式对话：</strong>后端 pipe SSE 至浏览器，前端基于 fetch-event-source
                逐字渲染；sessionStorage 维护多轮 conversation_id，localStorage 持久化历史消息</li
              >
              <li
                ><strong>体验闭环：</strong>支持 Markdown/GFM
                富消息、三档满意度与点踩反馈、转人工跳转；URL model 参数驱动工作流
                inputs，适配多产品型号问答</li
              >
              <li
                >上线后客服部门工作量减轻<span class="metric">30%</span>，支撑说明书等高 PV
                场景智能问答落地</li
              >
            </ul>
          </li>
          <li>
            <h4>存储卡防伪码</h4>
            <span class="field-label">项目描述：</span>
            <p
              >萤石存储卡正品验真系统，支持扫码/手输 16 位防伪码查询，对接 UMP/OA/SRM
              批量发码。技术栈：<span class="tech-stack">ThinkJS / MySQL / Redis / Vue 3</span>
            </p>
            <span class="field-label">个人产出：</span>
            <ul>
              <li
                ><strong>全栈交付：</strong>独立实现查询 API、批量发码与 C
                端验真页，覆盖国内移动端与海外 Web 双端</li
              >
              <li
                ><strong>验真逻辑：</strong>设计四类查询结果（正品/无效码/超次/IP
                限流），单码查询上限 + Redis 日 IP 限流，全量写入审计日志</li
              >
              <li
                ><strong>批量发码：</strong>对接内部系统批量生成唯一防伪码，支持单批最高 15
                万条分块事务写入与来源单号幂等去重</li
              >
              <li
                ><strong>扫码体验：</strong>萤石 App / 微信 JSSDK / H5
                摄像头自动策略切换，完成扫码识码与结果展示</li
              >
            </ul>
          </li>
          <li>
            <h4>技能市场</h4>
            <span class="field-label">项目描述：</span>
            <p
              >企业内 AI Agent Skill 技能市场，支持 Skill 发现、ZIP
              发布下载、版本治理与运营审核。技术栈：<span class="tech-stack"
                >React 19 / React Router v7 / Hono / SQLite / Drizzle / Zod / Bun</span
              >
            </p>
            <span class="field-label">个人产出：</span>
            <ul>
              <li
                ><strong>全栈架构：</strong>基于 React Router v7 SSR + Hono API
                同仓实现，覆盖技能浏览、发布、详情、收藏与运营后台全流程</li
              >
              <li
                ><strong>发布审核：</strong>构建 ZIP 发布链路（SKILL.md
                解析、静态启发式扫描、质量门），并对接 Dify 工作流异步 LLM
                复审，自动隐藏可疑内容</li
              >
              <li
                ><strong>发布体验：</strong>支持目录/ZIP 双通道上传，语义化版本号 + changelog + slug
                唯一校验；详情页 SKILL.md 渲染、文件树浏览与多版本切换</li
              >
              <li
                ><strong>版本治理：</strong>支持多版本管理、文件级 diff 对比、星标/举报与 moderator
                审核台（软删、徽章、审计日志）</li
              >
            </ul>
          </li>
          <li>
            <h4>萤石官方商城</h4>
            <span class="field-label">项目描述：</span>
            <p
              >萤石自有的商城微信小程序，具备商城及社区玩法能力，结合商家后台，页面可配置性强，满足运营多样化需求。技术栈：<span
                class="tech-stack"
                >微信原生小程序</span
              >
            </p>
            <span class="field-label">个人产出：</span>
            <ul>
              <li>
                <strong>插件定制：</strong>设计 wepy→webpack
                混合打包方案，开发冗余组件声明清理、无效样式清理插件；首轮清理组件声明
                150+、无效样式约 100KB
              </li>
              <li>
                <strong>通用组件：</strong
                >开发小程序不定高虚拟滚动组件，支持多列瀑布流、万级数据渲染
              </li>
              <li>
                <strong>技术推动：</strong>推行商城小程序 TypeScript 化，基于 Zod
                设计接口数据校验，线上单日捕获后端数据类型错误 1000+
              </li>
              <li>
                <strong>工具开发：</strong>开发测试环境切换、页面跳转、登录 token
                修改等「测试工具」系列，减少测试对开发的依赖
              </li>
            </ul>
          </li>
          <li>
            <h4>标签平台</h4>
            <span class="field-label">项目描述：</span>
            <p
              >通过对数据进行标签化生产管理、用户画像与数据洞察，快速分析并圈选人群。基于
              <span class="tech-stack">Qiankun 微前端 / Vue2 / Element UI / ECharts</span>
            </p>
            <span class="field-label">个人产出：</span>
            <ul>
              <li
                >封装业务图表组件，支持折线图、饼图、环形图、柱形图、象形柱图、混合图表等快速配置，统一项目图表接入方式</li
              >
              <li>以最低成本整合基座系统、用户、权限管理模块，并基于业务场景调整原有权限设计</li>
              <li
                >重构标签管理、群体管理、群体洞察模块，短期内完成衍生项目《人口数据管理平台》开发上线</li
              >
            </ul>
          </li>
        </ol>
      </section>
      <div class="split-line"></div>
      <section class="education">
        <h2>教育经历</h2>
        <p>
          <label
            >浙江大学城市学院 <span class="column-line">|</span> 本科
            <span class="column-line">|</span> 通信工程
            <span class="column-line">|</span> CET-6（能够进行基础口语交流）</label
          >
          <label>2017.09 - 2021.06</label>
        </p>
      </section>
    </article>
  </div>
  <template v-if="!isMobile">
    <n-button
      class="download-btn hidden-when-print"
      quaternary
      type="info"
      key="download"
      @click="handlePrint"
    >
      <n-icon size="20"><Download /></n-icon>
    </n-button>
    <n-button
      key="back"
      quaternary
      class="fixed left-20px top-20px hidden-when-print"
      @click="router.go('/')"
    >
      <n-icon size="20"><ArrowLeft /></n-icon>
      首页
    </n-button>
  </template>
</template>

<script setup lang="ts">
import { Download, ArrowLeft } from '@vicons/carbon';
import { useRouter } from 'vitepress';
import { useMediaQuery } from '@vueuse/core';

const isMobile = useMediaQuery('(max-width: 900px)');

const router = useRouter();
const handlePrint = () => {
  window.print();
};
</script>

<style lang="scss" scoped>
@use './style/index.scss' as *;

.resume-container {
  background: rgb(218, 220, 224);
}

.download-btn {
  position: fixed;
  right: 50px;
  bottom: 50px;
}

@media print {
  .resume-container {
    background: white;
  }

  :deep(article) {
    --resume-name: 24px;
    --resume-section: 15px;
    --resume-title: 13px;
    --resume-body: 12px;
    --resume-secondary: 11px;
    padding: 0.75cm 1.4cm;
    line-height: 1.38;
    box-shadow: none;
  }

  :deep(a) {
    border-bottom: none;
    color: #3c3c43;
  }

  :deep(h2) {
    margin: 4px 0 3px;
  }

  :deep(section) {
    margin: 2px 0;
  }

  :deep(.split-line) {
    margin: 4px 0;
  }

  :deep(li) {
    margin: 2px 0;
  }

  :deep(.projects > ol > li) {
    padding: 4px 0 6px;
  }

  .hidden-when-print {
    display: none;
  }
}

@media (max-width: 500px) {
  body {
    margin: 0;
  }

  :deep(article) {
    width: auto;
    height: auto;
    padding: 14px;
  }

  :deep(.skills-columns) {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
