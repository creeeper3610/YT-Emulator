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
    res.send(html);
    return;


    // ★ 新しい動画カード構造に対応
    const cards = [...html.matchAll(/<div class="dg_u">([\s\S]*?)<\/div>\s*<\/div>/g)];

    const results = [];

    for (const card of cards) {
      const block = card[1];

      // 動画ID
      const idMatch = block.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
      if (!idMatch) continue;
      const id = idMatch[1];

      // タイトル
      const titleMatch = block.match(/mc_vtvc_title[^>]*>([^<]+)/);
      const title = titleMatch ? titleMatch[1].trim() : null;

      // チャンネル名
      const channelMatch = block.match(/mc_vtvc_channel[^>]*>([^<]+)/);
      const channel = channelMatch ? channelMatch[1].trim() : null;

      // 視聴回数＋投稿日
      const metaMatch = block.match(/mc_vtvc_meta[^>]*>([^<]+)/);
      let views = null;
      let age = null;

      if (metaMatch) {
        const meta = metaMatch[1];

        const viewsMatch = meta.match(/([\d,.万億兆]+)\s*回視聴/);
        if (viewsMatch) views = viewsMatch[1];

        const ageMatch = meta.match(/回視聴\s*·\s*(.+)/);
        if (ageMatch) age = ageMatch[1];
      }

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
