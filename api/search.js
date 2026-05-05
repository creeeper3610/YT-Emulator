import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const q = req.query.q;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

    // Node 18 以降は fetch が標準搭載
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const ids = [];

    $("a#video-title").each((i, el) => {
      const href = $(el).attr("href");
      if (href && href.startsWith("/watch?v=")) {
        ids.push(href.replace("/watch?v=", ""));
      }
    });

    res.status(200).json(ids);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
