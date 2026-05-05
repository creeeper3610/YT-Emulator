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

    // ★ mmeta と aria-label を同時に取る
    const cards = [...html.matchAll(
      /mmeta="([^"]+)"[\s\S]*?aria-label="([^"]*)"/g
    )];

    const results = [];

    for (const card of cards) {
      const rawMeta = card[1];

      // mmeta JSON をデコード
      const meta = JSON.parse(
        rawMeta.replace(/&quot;/g, '"').replace(/&amp;/g, '&')
      );

      // YouTube ID
      const idMatch = meta.murl.match(/v=([a-zA-Z0-9_-]+)/);
      const id = idMatch ? idMatch[1] : null;

      // 視聴回数（vsc があれば最優先）
      let views = null;
      if (meta.vsc) {
        views = meta.vsc; // 生の数字（例：220000）
      }

      // 投稿日（pdate があれば最優先）
      let age = null;
      if (meta.pdate) {
        age = meta.pdate; // 例：2023-06-12
      }

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
