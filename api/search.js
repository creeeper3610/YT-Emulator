export default async function handler(req, res) {
  try {
    const q = req.query.q;

    const url = `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(q)}`;

    const response = await fetch(url);
    const data = await response.json();

    // 通常動画だけ抽出
    const results = data
      .filter(item => item.type === "video")
      .map(item => ({
        id: item.videoId,
        title: item.title,
        thumbnail: item.thumbnail
      }));

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
