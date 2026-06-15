import { withBase } from 'vitepress';
import { base } from '../shared/index';

/**
 * 与正文 Markdown 走同一套 Vite 资源管线，得到带 hash 的最终 URL。
 * Reveal 读的是原始 md，需按「当前页 url + ./images/」解析到真实文件。
 *
 * 约定：`docs/<栏目>/.../images/*` 与对应页面里 `![](./images/xxx)` 一致。
 */
const globModules = import.meta.glob('../../**/images/*.{jpeg,jpg,png,gif,webp}', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>;

/** Map: `ai-robot/images/foo.jpeg`（相对 docs/）→ 构建后的 URL */
const pathToUrl = new Map<string, string>();
for (const viteKey of Object.keys(globModules)) {
  const m = viteKey.match(/^\.\.\/\.\.\/(.*)$/);
  const relFromDocs = m ? m[1] : viteKey.replace(/^(\.\.\/)+/, '');
  pathToUrl.set(relFromDocs.replace(/\\/g, '/'), globModules[viteKey]);
}

function ensureWithBase(url: string): string {
  if (!url) return url;
  if (url.startsWith('http:') || url.startsWith('https:')) return url;
  if (url.startsWith(`${base}/`) || url === base) return url;
  return withBase(url.startsWith('/') ? url : `/${url}`);
}

/**
 * 由 VitePress 页面 url（不含 base，如 `/ai-robot`、`/computer-basic/internet`）得到可能的 images 路径前缀。
 */
function imageKeysForPage(pageUrlPath: string, filename: string): string[] {
  const p = pageUrlPath.replace(/^\/+|\/+$/g, '');
  const keys: string[] = [];
  if (!p || p === 'index') {
    keys.push(`images/${filename}`);
  } else {
    keys.push(`${p}/images/${filename}`);
  }
  return keys;
}

export type ResolveSlideMarkdownImagesInput = {
  markdown: string;
  /** `route.path` 去掉 `base` 后的路径，如 `/ai-robot` */
  pageUrlPath: string;
};

/**
 * 将当前页中的 `![](./images/xxx.ext)` 替换为构建后的资源 URL。
 */
export function resolveSlideMarkdownImages({
  markdown,
  pageUrlPath
}: ResolveSlideMarkdownImagesInput): string {
  return markdown.replace(/\]\(\.\/images\/([^)]+)\)/g, (full, rest: string) => {
    const filename = /^([^"\s]+)/.exec(rest)?.[1];
    if (!filename) return full;
    const keys = imageKeysForPage(pageUrlPath, filename);
    let resolved: string | undefined;
    for (const k of keys) {
      const u = pathToUrl.get(k);
      if (u) {
        resolved = u;
        break;
      }
    }
    if (!resolved) return full;
    const suffix = rest.slice(filename.length);
    return `](${ensureWithBase(resolved)}${suffix})`;
  });
}
