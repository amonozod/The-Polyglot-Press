// Fetches dynamic content (videos, articles, team, issues) from Supabase
// and renders it into the page. Falls back silently if not configured yet.

function videoCardHTML(v) {
  const thumb = v.thumbnail_url
    ? `<img src="${v.thumbnail_url}" alt="">`
    : `<div class="media"></div>`;
  return `
    <a class="video-card" href="${v.video_url}" target="_blank" rel="noopener">
      <div class="video-thumb">${thumb}<div class="play-btn"></div></div>
      <h4>${v.title}</h4>
      <div class="card-meta">${v.duration || ""}${v.duration && v.category ? " · " : ""}${v.category || ""}</div>
    </a>`;
}

async function loadVideos(containerId, limit) {
  const el = document.getElementById(containerId);
  if (!el) return;
  try {
    let query = supabaseClient.from("videos").select("*").order("published_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length) {
      el.innerHTML = data.map(videoCardHTML).join("");
    }
  } catch (e) { /* leave existing placeholder content if Supabase isn't reachable */ }
}

function teamCardHTML(m) {
  const photo = m.photo_url ? `<img src="${m.photo_url}" alt="">` : `<div class="media"></div>`;
  return `<div class="team-card">${photo}<h3>${m.name}</h3><div class="role">${m.role}</div></div>`;
}

async function loadTeam(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  try {
    const { data, error } = await supabaseClient.from("team_members").select("*").order("sort_order", { ascending: true });
    if (error) throw error;
    if (data && data.length) el.innerHTML = data.map(teamCardHTML).join("");
  } catch (e) { /* keep placeholder */ }
}

function issueRowHTML(i) {
  const cover = i.cover_url ? `<img src="${i.cover_url}" alt="">` : `<div class="media" style="aspect-ratio:3/4;"></div>`;
  return `
    <div class="issue-row">
      ${cover}
      <div>
        <div class="kicker">Issue ${String(i.issue_number).padStart(2, "0")}</div>
        <h3>${i.title}</h3>
        <p style="color:var(--muted); font-size:0.94rem;">${i.description || ""}</p>
      </div>
      <a href="${i.pdf_url || '#'}" target="_blank" rel="noopener" class="btn btn-outline">Read Issue</a>
    </div>`;
}

async function loadIssues(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  try {
    const { data, error } = await supabaseClient.from("issues").select("*").order("issue_number", { ascending: false });
    if (error) throw error;
    if (data && data.length) el.innerHTML = data.map(issueRowHTML).join("");
  } catch (e) { /* keep placeholder */ }
}

function timeAgo(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function readTime(content) {
  const words = (content || "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200)) + " min read";
}

function articleCardHTML(a) {
  const img = a.image_url ? `<img src="${a.image_url}" alt="">` : `<div class="media" style="aspect-ratio:4/3; margin-bottom:16px;"></div>`;
  return `
    <a class="article-card" href="article.html?slug=${encodeURIComponent(a.slug)}">
      ${img}
      <div class="kicker">${a.category || ""}</div>
      <h3>${a.title}</h3>
      <p>${a.dek || ""}</p>
      <div class="card-meta"><span>${a.category || ""}</span><span class="dot"></span><span>${readTime(a.content)}</span></div>
    </a>`;
}

async function loadArticles(containerId, limit) {
  const el = document.getElementById(containerId);
  if (!el) return;
  try {
    let query = supabaseClient.from("articles").select("*").order("published_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length) el.innerHTML = data.map(articleCardHTML).join("");
  } catch (e) { /* keep static placeholder */ }
}

async function loadArticleBySlug(slug) {
  const { data, error } = await supabaseClient.from("articles").select("*").eq("slug", slug).single();
  if (error) throw error;
  return data;
}
async function loadComments(slug, listId) {
  const el = document.getElementById(listId);
  if (!el) return;
  try {
    const { data, error } = await supabaseClient
      .from("comments").select("*").eq("article_slug", slug).eq("approved", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (data) {
      el.innerHTML = data.map(c => `
        <div class="comment-item">
          <div class="comment-avatar">${c.name.charAt(0).toUpperCase()}</div>
          <div><span class="comment-name">${c.name}</span><span class="comment-date">${new Date(c.created_at).toLocaleDateString()}</span>
          <div class="comment-text">${c.text}</div></div>
        </div>`).join("") || '<p style="color:var(--muted); font-size:0.9rem;">Be the first to comment.</p>';
    }
  } catch (e) { /* keep any static placeholder comments already in the HTML */ }
}

async function postComment(slug, name, text) {
  const { error } = await supabaseClient.from("comments").insert({ article_slug: slug, name: name || "Anonymous", text });
  if (error) throw error;
}

async function loadRatingSummary(slug, textId) {
  const el = document.getElementById(textId);
  if (!el) return;
  try {
    const { data, error } = await supabaseClient.from("ratings").select("stars").eq("article_slug", slug);
    if (error) throw error;
    if (data && data.length) {
      const avg = data.reduce((a, r) => a + r.stars, 0) / data.length;
      el.textContent = avg.toFixed(1) + " / 5 from " + data.length + " reader" + (data.length === 1 ? "" : "s");
    }
  } catch (e) { /* keep static placeholder */ }
}

async function postRating(slug, stars) {
  const { error } = await supabaseClient.from("ratings").insert({ article_slug: slug, stars });
  if (error) throw error;
}
