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

    // YouTube動画カードを全部取る
    const cards = [...html.matchAll(/mc_vtvc_card([\s\S]*?)<\/div>/g)];

    const results = [];

    for (const card of cards) {
      const block = card[1];

      // 動画ID
      const idMatch = block.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
      if (!idMatch) continue;
      const id = idMatch[1];

      // タイトル
      const titleMatch = block.match(/title="([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : null;

      // チャンネル名
      const channelMatch = block.match(/mc_vtvc_meta">([^<]+)</);
      const channel = channelMatch ? channelMatch[1].trim() : null;

      // 視聴回数
      const viewsMatch = block.match(/([\d,.万億兆]+)\s*回視聴/);
      const views = viewsMatch ? viewsMatch[1] : null;

      // 投稿日（何日前 / 何年前）
      const ageMatch = block.match(/回視聴\s*·\s*([^<]+)/);
      const age = ageMatch ? ageMatch[1].trim() : null;

      results.push({
        id,
        title,
        channel,
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
