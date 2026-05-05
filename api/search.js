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

    // ytInitialData を複数パターンで探す
    const match =
      html.match(/ytInitialData"\]

\s*=\s*(\{.*?\});/s) ||
      html.match(/ytInitialData\s*=\s*(\{.*?\});/s) ||
      html.match(/window

\["ytInitialData"\]

\s*=\s*(\{.*?\});/s);

    if (!match) {
      return res.status(500).json({ error: "ytInitialData not found" });
    }

    const data = JSON.parse(match[1]);

    const contents =
      data.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

    const results = [];

    for (const item of contents) {
      const video = item.videoRenderer;
      if (!video) continue;

      results.push({
        id: video.videoId,
        title: video.title?.runs?.[0]?.text || "",
        thumbnail: video.thumbnail?.thumbnails?.pop()?.url || "",
      });
    }

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
