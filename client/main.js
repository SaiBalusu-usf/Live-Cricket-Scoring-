const scoreBox   = document.getElementById("score");
const updatedTag = document.getElementById("updated");

async function getScore() {
  const res  = await fetch("/api/score").then(r => r.json());
  if (res.error) {
    scoreBox.textContent = res.error;
    return;
  }
  const { teams, scores, runRate, updated } = res;

  scoreBox.innerHTML = `
    <p><strong>${teams[0]}</strong> – ${scores[0]}</p>
    <p><strong>${teams[1]}</strong> – ${scores[1] ?? "—"}</p>
    <p>Req RR : ${runRate || "—"}</p>`;
  updatedTag.textContent = \`Last updated \${new Date(updated).toLocaleTimeString()}\`;
}

getScore();                       // first call
setInterval(getScore, 30_000);    // poll every 30 s
