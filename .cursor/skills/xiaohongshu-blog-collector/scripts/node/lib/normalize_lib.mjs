/** 与 Python collect_with_browser_mcp 对齐的字段映射 */

export const SELECTORS = {
  profile_ready_signals: [
    "a[href*='/user/profile/']",
    "input[placeholder*='搜索小红书']",
  ],
  post_cards: ['a[href*="/explore/"]'],
  detail_container: ["[class*='note-detail']", "[class*='note-scroller']"],
  title: ["h1", "[class*='title']"],
  content: ["[class*='desc']", "[class*='content']", "article"],
  tags: ['a[href*="search_result"]', "[class*='tag']"],
  counts: [
    "[class*='interact'] span",
    "[class*='like'] span",
    "[class*='collect'] span",
    "[class*='comment'] span",
  ],
  comments: ["[class*='comment-item']"],
  hot_comments: ["[class*='hot'] [class*='comment-item']"],
  close_button: [
    "button[class*='close']",
    "[class*='note-detail'] button:first-child",
  ],
};

/** 与 Python datetime.now(timezone.utc).replace(microsecond=0).isoformat() 相近 */
export function nowIsoUtc() {
  return new Date().toISOString().slice(0, 19) + "+00:00";
}

export function pickText(value) {
  if (value == null) return "";
  if (typeof value === "number") return String(value);
  return String(value).trim();
}

export function parsePostId(postUrl) {
  const m = String(postUrl || "").match(/\/explore\/([a-zA-Z0-9]+)/);
  return m ? m[1] : "";
}

export function parseCountTriplet(raw) {
  const r = raw && typeof raw === "object" ? raw : {};
  return {
    like_count_text: pickText(r.like_count_text ?? r.like),
    comment_count_text: pickText(r.comment_count_text ?? r.comment),
    collect_count_text: pickText(r.collect_count_text ?? r.collect),
  };
}

export function normalizeCommentList(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((c) => c && typeof c === "object")
    .map((c) => ({
      user: pickText(c.user ?? c.nickname),
      content: pickText(c.content ?? c.text),
      like_count_text: pickText(c.like_count_text ?? c.likes),
    }));
}

export function formatTimeText(t) {
  const s = pickText(t);
  if (!s) return "";
  if (/^\d+$/.test(s) && s.length >= 10) {
    let ts = parseInt(s, 10);
    if (s.length === 13) ts = Math.floor(ts / 1000);
    try {
      return new Date(ts * 1000).toISOString().split(".")[0] + "Z";
    } catch {
      return s;
    }
  }
  return s;
}

export function normalizePayloadItem(item, creatorUrl) {
  const postUrl = pickText(item.post_url);
  const counts = parseCountTriplet(item.counts);
  const raw = item.raw;
  return {
    post_id: pickText(item.post_id) || parsePostId(postUrl),
    post_url: postUrl,
    creator_url: pickText(item.creator_url) || creatorUrl,
    creator_name: pickText(item.creator_name),
    title: pickText(item.title),
    content_text: pickText(item.content_text),
    tags: (Array.isArray(item.tags) ? item.tags : []).map((t) => pickText(t)).filter(Boolean),
    publish_time_text: formatTimeText(pickText(item.publish_time_text)),
    like_count_text: counts.like_count_text,
    comment_count_text: counts.comment_count_text,
    collect_count_text: counts.collect_count_text,
    hot_comments: normalizeCommentList(item.hot_comments),
    all_comments_preview: normalizeCommentList(item.all_comments_preview),
    cover_image_url: pickText(item.cover_image_url),
    captured_at: pickText(item.captured_at) || nowIsoUtc(),
    raw: raw && typeof raw === "object" ? raw : item,
  };
}

export function buildOperationPlan(creatorUrl, maxPosts) {
  return {
    creator_url: creatorUrl,
    login_wait: {
      check: "url contains /login",
      poll_every_seconds: 2,
      timeout_seconds: 300,
      ready_signals: SELECTORS.profile_ready_signals,
    },
    collection_flow: [
      "navigate creator_url",
      "wait_login_if_needed",
      "scroll_until_stable",
      `collect_first_${maxPosts}_cards_or_all`,
      "for each note: goto url -> extract",
    ],
    selectors: SELECTORS,
  };
}
