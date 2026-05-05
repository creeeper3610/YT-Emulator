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
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const html = await response.text();

    // YouTube の動画IDだけ抜き出す
    const ytMatches = [...html.matchAll(/https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g)];
    const youtubeList = [...new Set(ytMatches.map(m => m[1]))];

    res.status(200).json({
      first,
      youtubeList, // ここに最大10件くらい入る想定
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
