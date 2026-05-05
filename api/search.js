import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const q = req.query.q;
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

  const html = await fetch(url).then(r => r.text());
  const $ = cheerio.load(html);

  const ids = [];

  $("a#video-title").each((i, el) => {
    const href = $(el).attr("href");
    if (href && href.startsWith("/watch?v=")) {
      const id = href.replace("/watch?v=", "");
      ids.push(id);
    }
  });

  res.status(200).json(ids);
}
