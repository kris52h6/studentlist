window.addEventListener("DOMContentLoaded", getJson);
const modtagerKloner = document.querySelector(".personliste");
const skabelon = document.querySelector("template");
let students;

async function getJson() {
  let jsondata = await fetch("students1991.json");
  console.log("jsondata", jsondata);

  minJson = await jsondata.json();
  console.log(minJson);
  vis();
}

function vis() {
  if (modtagerKloner) {
    modtagerKloner.innerHTML = "";

    minJson.forEach(student => {
      const klon = skabelon.cloneNode(true).content;

      klon.querySelector(".name").textContent = student.fullname + "   *";
      klon.querySelector(".house").textContent = student.house;

      modtagerKloner.appendChild(klon);

      modtagerKloner.lastElementChild.addEventListener("click", () => {
        visPopup(student);
      });
    });
  }
}
function visPopup(student) {
  document.querySelector("#popup").style.display = "block";
  document.querySelector(".luk").addEventListener("click", skjulPopup);

  document.querySelector(".name2").textContent = student.fullname;
  document.querySelector(".house2").textContent = student.house;
}

function skjulPopup() {
  document.querySelector("#popup").style.display = "none";
}
