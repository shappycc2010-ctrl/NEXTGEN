const introText = document.getElementById("introText");
const subText = document.getElementById("subText");

const stages = [
  { text: "THE FUTURE", sub: "" },
  { text: "IS HERE", sub: "" },
  { text: "NEXTGEN", sub: "THE FUTURE 🔮 WILL COME HERE" },
];

let stageIndex = 0;

function showNextStage() {
  if (stageIndex < stages.length) {
    introText.textContent = stages[stageIndex].text;
    subText.textContent = stages[stageIndex].sub;
    stageIndex++;

    setTimeout(showNextStage, 2000);
  } else {
    document.body.classList.add("fade-out");
    setTimeout(() => {
      window.location.href = "home.html";
    }, 1500);
  }
}

window.onload = showNextStage;
