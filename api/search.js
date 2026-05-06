export default async function handler(req, res) {
  try {
    const q = req.query.q;
    const first = parseInt(req.query.first || "0", 10);

    const url =
      "https://www.bing.com/videos/search" +
      `?q=${encodeURIComponent(q)}` +
      `&first=${first}` +
      "&qft=+filterui:site-youtube.com" +
      "&FORM=VRFLTR";

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
      },
    });

    const html = await response.text();

    // ★ 動画カードを抽出
    const cards = [...html.matchAll(
      /<div id="mc_vtvc_video_[^"]+"([\s\S]*?)<\/div><\/div>/g
    )];

    const results = [];

    for (const card of cards) {
      const block = card[1];

      // YouTube ID（mmeta の murl から）
      const murlMatch = block.match(/"murl":"([^"]+)"/);
      let id = null;
      if (murlMatch) {
        const url = murlMatch[1];
        const idMatch = url.match(/v=([a-zA-Z0-9_-]+)/);
        id = idMatch ? idMatch[1] : null;
      }

      // 視聴回数
      const viewsMatch = block.match(/<span class="meta_vc_content">([^<]+)<\/span>/);
      const views = viewsMatch ? viewsMatch[1].trim() : null;

      // 投稿日
      const ageMatch = block.match(/<span class="meta_pd_content">([^<]+)<\/span>/);
      const age = ageMatch ? ageMatch[1].trim() : null;

      results.push({
        id,
        views,
        age,
      });
    }

    res.status(200).json({
      first,
      videos: results,
    });

  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
