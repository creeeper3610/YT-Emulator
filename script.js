document.getElementById("searchBtn").addEventListener("click", search);

async function search() {
  const q = document.getElementById("q").value.trim();
  if (!q) return;

  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const ids = await res.json();

  const container = document.getElementById("results");
  container.innerHTML = "";

  ids.forEach(id => {
    const div = document.createElement("div");
    div.innerHTML = `
      <iframe width="560" height="315"
        src="https://www.youtube.com/embed/${id}"
        allowfullscreen>
      </iframe>
      <hr>
    `;
    container.appendChild(div);
  });
}
