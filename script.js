document.getElementById("searchBtn").addEventListener("click", search);

async function search() {
  const q = document.getElementById("q").value.trim();
  if (!q) return;

  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const videos = await res.json();

  const container = document.getElementById("results");
  container.innerHTML = "";

  videos.forEach(v => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${v.title}</h3>
      <img src="${v.thumbnail}" width="320">
      <br>
      <iframe width="560" height="315"
        src="https://www.youtube.com/embed/${v.id}"
        allowfullscreen>
      </iframe>
      <hr>
    `;
    container.appendChild(div);
  });
}
