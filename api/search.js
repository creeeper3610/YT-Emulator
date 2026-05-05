export default async function handler(req, res) {
  try {
    const q = req.query.q;
    const page = parseInt(req.query.page || "0", 10);

    // Bing の 1ページは約55件
    const first = page * 55;

    const url = `https://www.bing.com/videos/search?q=${encodeURIComponent(q)}&first=${first}&form=QBVLPG`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const html = await response.text();

    const matches = [...html.matchAll(/https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g)];
    const ids = [...new Set(matches.map(m => m[1]))];

    res.status(200).json({
      page,
      count: ids.length,
      videos: ids
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
