export default async function handler(req, res) {
  try {
    const q = req.query.q;

    const url = `https://www.bing.com/videos/search?q=${encodeURIComponent(q)}&form=QBVLPG`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const html = await response.text();

    // YouTube の動画URLだけ抽出
    const matches = [...html.matchAll(/https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g)];

    const ids = [...new Set(matches.map(m => m[1]))]; // 重複削除

    res.status(200).json(ids);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
