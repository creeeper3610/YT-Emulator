export default async function handler(req, res) {
  try {
    const q = req.query.q;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const html = await response.text();

    // ytInitialData を含む script タグを全部抽出
    const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
      .map(m => m[1])
      .filter(s => s.includes("ytInitialData"));

    // 何個見つかったか返す
    return res.status(200).json({
      foundScripts: scripts.length,
      samples: scripts.slice(0, 2) // 最初の2つだけ返す（重すぎ防止）
    });

  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
