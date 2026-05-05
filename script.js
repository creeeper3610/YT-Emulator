document.getElementById("searchBtn").addEventListener("click", search);

async function search() {
    const q = document.getElementById("q").value.trim();
    if (!q) return;

    const res = await fetch(`/search?q=${encodeURIComponent(q)}`);
    const ids = await res.json();

    const container = document.getElementById("results");
    container.innerHTML = "";

    ids.forEach(id => {
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${id}`;
        iframe.width = "560";
        iframe.height = "315";
        iframe.allowFullscreen = true;
        iframe.style.marginBottom = "20px";
        container.appendChild(iframe);
    });
}
