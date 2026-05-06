export default async function handler(req, res) {
  try {
    const q = req.query.q;
    const first = parseInt(req.query.first || "0", 10);

    const url =
      "https://www.bing.com/videos/search" +
      `?q=${encodeURIComponent(q)}` +
      `&first=${first}` +
      "&qft=+filterui:site-youtube.com" +
      "&mkt=ja-JP" +   // ★ 日本向け市場
      "&cc=JP" +       // ★ 国コードを日本に
      "&FORM=VRFLTR";


    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
      },
    });

    const html = await response.text();

    // ★ 動画カード抽出（mc_vtvc_video_◯◯ から vrhdata 直前まで）
    const cards = [...html.matchAll(
      /<div id="mc_vtvc_video_[^"]+"([\s\S]*?)<div class="vrhdata"/g
    )];

    const results = [];

    for (const card of cards) {
      const block = card[1];

      // ★ ① iframe 用の本物の YouTube URL（ourl=""）
      const ourlMatch = block.match(/ourl="([^"]+)"/);
      const youtubeUrl = ourlMatch ? ourlMatch[1] : null;

      // YouTube ID 抽出
      let id = null;
      if (youtubeUrl) {
        const idMatch = youtubeUrl.match(/v=([a-zA-Z0-9_-]+)/);
        id = idMatch ? idMatch[1] : null;
      }

      // ★ ② 視聴回数（meta_vc_content）
      const viewsMatch = block.match(/<span class="meta_vc_content">([^<]+)<\/span>/);
      let views = viewsMatch ? viewsMatch[1].trim() : null;

      // 不要な「視聴回数:」「回」を削除
      if (views) {
        views = views
          .replace("視聴回数:", "")
          .replace("回", "")
          .trim();
      }

      // ★ ③ 投稿日（meta_pd_content）
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
