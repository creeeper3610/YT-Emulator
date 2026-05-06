<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>youtube search tool</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/svg+xml" href="ver.1/ytst_icon.svg">
  <meta name="robots" content="noindex, nofollow">
  <style>
    header h1 {
      text-align: center;
      width: 100%;
    }

    body {
      margin: 0;
      padding: 0;
      background: #050505;
      color: #f5f5f5;
      font-family: system-ui, sans-serif;
    }

    header {
      padding: 16px;
      background: #111;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 20px;
    }

    .search-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .search-center {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    header {
      position: relative;
    }

    header .search-logo {
      position: absolute;
      top: 16px;
      left: 16px;
      height: 48px;
      margin: 0;
    }

    .search-box input {
      width: 60%;
      max-width: 400px;
      padding: 8px 10px;
      border-radius: 4px;
      border: 1px solid #333;
      background: #000;
      color: #f5f5f5;
    }

    .search-box button {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      background: #2563eb;
      color: #fff;
      cursor: pointer;
    }

    main {
      padding: 12px;
    }

    #results {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .video-item {
      background: #111;
      padding: 8px;
      border-radius: 8px;
      box-shadow: 0 0 0 1px #222;
    }

    .video-item iframe {
      width: 100%;
      aspect-ratio: 16 / 9;
      border: none;
      border-radius: 6px;
    }

    .meta {
      margin-top: 6px;
      font-size: 13px;
      color: #ccc;
      line-height: 1.4;
    }

    .pager-buttons {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin: 20px 0;
    }

    .pager-buttons button {
      padding: 10px 20px;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      font-size: 14px;
    }

    .pager-prev {
      background: #6b7280;
      color: #fff;
    }

    .pager-next {
      background: #3b82f6;
      color: #fff;
    }
  </style>
</head>

<body>
  <header>
    <img src="ver.1/youtube_search_tool.svg" alt="logo" class="search-logo">
    <h1>YouTube Search Tool</h1>

    <div class="search-box">
      <div class="search-center">
        <input type="text" id="keyword" placeholder="キーワードを入力">
        <button id="search-btn">search</button>
      </div>
    </div>
  </header>

  <main>
    <div id="results"></div>

    <div class="pager-buttons">
      <button id="prevPageBtn" class="pager-prev" style="display:none;">前のページ</button>
      <button id="nextPageBtn" class="pager-next" style="display:none;">次のページ</button>
    </div>
  </main>

  <script>
    let currentFirst = 0;
    const PAGE_SIZE = 10;

    const resultsEl = document.getElementById("results");
    const searchBtn = document.getElementById("search-btn");
    const inputEl = document.getElementById("keyword");
    const prevPageBtn = document.getElementById("prevPageBtn");
    const nextPageBtn = document.getElementById("nextPageBtn");

    searchBtn.addEventListener("click", startSearch);
    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") startSearch();
    });

    prevPageBtn.addEventListener("click", () => {
      if (currentFirst >= PAGE_SIZE) {
        currentFirst -= PAGE_SIZE;
        loadPage();
      }
    });

    nextPageBtn.addEventListener("click", () => {
      currentFirst += PAGE_SIZE;
      loadPage();
    });

    function startSearch() {
      const q = inputEl.value.trim();
      if (!q) return;

      currentFirst = 0;
      loadPage();
    }

    async function loadPage() {
      const q = inputEl.value.trim();
      if (!q) return;

      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&first=${currentFirst}`);
      const data = await res.json();
      const videos = data.videos;

      renderVideos(videos);

      prevPageBtn.style.display = currentFirst > 0 ? "inline-block" : "none";
      nextPageBtn.style.display = videos.length < PAGE_SIZE ? "none" : "inline-block";
    }

    function renderVideos(videos) {
      resultsEl.innerHTML = "";

      videos.forEach(v => {
        const div = document.createElement("div");
        div.className = "video-item";
        div.innerHTML = `
          <iframe src="https://www.youtube.com/embed/${v.id}" allowfullscreen></iframe>
          <div class="meta">
            <div>${v.channel || ""}</div>
            <div>
              ${v.views ? `${v.views} 回再生` : ""}
              ${v.age ? ` · ${v.age}` : ""}
            </div>
          </div>
        `;
        resultsEl.appendChild(div);
      });
    }
  </script>
</body>
</html>
