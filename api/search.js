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

    // ★ 新しい動画カード構造に対応
    const cards = [...html.matchAll(
      /mmeta="([^"]+)"[\s\S]*?aria-label="([^"]+)"/g
    )];

    const results = [];

    for (const card of cards) {
      const rawMeta = card[1];
      const aria = card[2];

      // mmeta JSON をデコード
      const meta = JSON.parse(
        rawMeta.replace(/&quot;/g, '"').replace(/&amp;/g, '&')
      );

      // YouTube URL → ID 抽出
      const idMatch = meta.murl.match(/v=([a-zA-Z0-9_-]+)/);
      const id = idMatch ? idMatch[1] : null;

      // 視聴回数
      const viewsMatch = aria.match(/視聴回数:\s*([^·]+)/);
      const views = viewsMatch ? viewsMatch[1].trim() : null;

      // 投稿日（YYYY年MM月DD日）
      const dateMatch = aria.match(/(\d{4}年\d{1,2}月\d{1,2}日)/);
      const age = dateMatch ? dateMatch[1] : null;

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
