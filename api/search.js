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
    const cards = [...html.matchAll(/<div[^>]+class="mc_vtvc[^"]*"[^>]*mmeta="([^"]+)"[\s\S]*?aria-label="([^"]+)"/g)];

    const results = [];

    for (const card of cards) {
      const mmetaRaw = card[1];
      const aria = card[2];

      // mmeta は HTML エスケープされているのでデコード
      const mmetaJson = JSON.parse(
        mmetaRaw
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
      );

      const youtubeUrl = mmetaJson.murl;
      const idMatch = youtubeUrl.match(/v=([a-zA-Z0-9_-]+)/);
      const id = idMatch ? idMatch[1] : null;

      // aria-label から情報抽出
      // 例：
      // 【5科目】中間・期末テストの勉強法 提供元: YouTube · 期間: 17 分 43 秒 · 視聴回数: 22万 回 · 2023年6月12日 にアップロードされたビデオ · とある男が授業をしてみた がアップロードしたビデオ
      const title = aria.split("提供元:")[0].trim();

      const viewsMatch = aria.match(/視聴回数:\s*([^·]+)/);
      const views = viewsMatch ? viewsMatch[1].trim() : null;

      const dateMatch = aria.match(/(\d{4}年\d{1,2}月\d{1,2}日)/);
      const age = dateMatch ? dateMatch[1] : null;

      const channelMatch = aria.match(/·\s*([^·]+?)\s*がアップロードしたビデオ/);
      const channel = channelMatch ? channelMatch[1].trim() : null;

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
