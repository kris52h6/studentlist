window.addEventListener("DOMContentLoaded", start);
const modtagerKloner = document.querySelector(".personliste");
const skabelon = document.querySelector("template");

const allStudents = [];
let currentStudents = [];
let expelledStudents = [];
const mySorting = document.querySelectorAll("#sorting > button");
let bloodArray = [];
let halfBloodArray = [];
let pureBloodArray = [];

let selectedFilter;

const Student = {
  firstName: "",
  lastName: "",
  middleName: undefined,
  nickName: undefined,
  house: "",
  img: "",
  prefect: false,
  expelled: false,
  bloodtype: ""
};

function start() {
  document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", handleFilter);
  });

  mySorting.forEach(button => {
    button.addEventListener("click", sortButtonClick);
  });

  document.querySelector(".sound").addEventListener("click", startTheme);

  getJson();
}

function startTheme() {
  document.querySelector("#hp_theme").volume = 0.5;
  document.querySelector("#hp_theme").play();
}

async function getJson() {
  let jsonData = await fetch("https://petlatkea.dk/2020/hogwarts/students.json");
  minJson = await jsonData.json();

  let bloodData = await fetch("https://petlatkea.dk/2020/hogwarts/families.json");
  bloodArray = await bloodData.json();
  prepareData(minJson, bloodArray);

  document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", handleFilter);
  });
}

function prepareData(students) {
  students.forEach(jsonObject => {
    let student = Object.create(Student);

    // FULL NAME
    let fullName = jsonObject.fullname.trim();
    fullName = fullName.toLowerCase();

    // FIRST NAME
    let firstChar = fullName.substring(0, 1);
    firstChar = firstChar.toUpperCase();

    student.firstName = fullName.substring(1, fullName.indexOf(" "));
    student.firstName = firstChar + student.firstName;

    // LAST NAME
    student.lastName = fullName.substring(fullName.lastIndexOf(" ") + 1, fullName.length + 1);

    let firstCharLastName = student.lastName.substring(0, 1);
    firstCharLastName = firstCharLastName.toUpperCase();
    student.lastName = firstCharLastName + fullName.substring(fullName.lastIndexOf(" ") + 2, fullName.length + 1);

    if (student.lastName.includes("-")) {
      let firstLastName = student.lastName.substring(0, student.lastName.indexOf("-"));
      let secondLastName = student.lastName.substring(student.lastName.indexOf("-") + 1);
      let firstCharSecondLastName = secondLastName.substring(0, 1);
      firstCharSecondLastName = firstCharSecondLastName.toUpperCase();
      secondLastName = firstCharSecondLastName + student.lastName.substring(student.lastName.indexOf("-") + 2);

      student.lastName = firstLastName + "-" + secondLastName;
    }
    // MIDDLE NAME
    student.middleName = fullName.substring(student.firstName.length + 1, fullName.lastIndexOf(" "));

    let firstCharMiddle = student.middleName.substring(0, 1);
    firstCharMiddle = firstCharMiddle.toUpperCase();

    if (student.middleName == " ") {
      student.middleName = undefined;
    } else if (student.middleName.includes('"')) {
      firstCharMiddle = student.middleName.substring(1, 2);
      firstCharMiddle = firstCharMiddle.toUpperCase();
      student.nickName = firstCharMiddle + fullName.substring(student.firstName.length + 3, fullName.lastIndexOf(" ") - 1);
      student.middleName = undefined;
    } else {
      student.middleName = firstCharMiddle + fullName.substring(student.firstName.length + 2, fullName.lastIndexOf(" "));
    }

    if (fullName.includes(" ") == false) {
      student.firstName = fullName.substring(1);
      student.firstName = firstChar + student.firstName;

      student.middleName = undefined;
      student.lastName = undefined;
    }
    // PHOTO
    photoFirstChar = firstChar.toLowerCase();
    student.photo = "images/" + student.lastName + "_" + photoFirstChar + ".png";

    // GENDER

    genderFirstChar = jsonObject.gender.substring(0, 1);
    genderFirstChar = genderFirstChar.toUpperCase();
    student.genderName = jsonObject.gender.substring(1);
    student.gender = genderFirstChar + student.genderName;

    // BLOOD STATUS
    halfBloodArray = bloodArray.half;
    pureBloodArray = bloodArray.pure;

    const halfBloodType = halfBloodArray.some(halfBlood => {
      return halfBlood === student.lastName;
    });

    const pureBloodType = pureBloodArray.some(pureBlood => {
      return pureBlood === student.lastName;
    });

    if (halfBloodType === true) {
      student.blood = "Halfblood";
    } else if (pureBloodType === true) {
      student.blood = "Pureblood";
    } else {
      student.blood = "Muggle scum";
    }

    // HOUSE

    let houseName = jsonObject.house.trim();
    houseName = houseName.toLowerCase();
    let houseNameFirstChar = houseName.substring(0, 1);
    houseNameFirstChar = houseNameFirstChar.toUpperCase();

    student.house = houseNameFirstChar + houseName.substring(1, houseName.length);

    allStudents.push(student);
  });

  displayList(allStudents);
}

function displayList(students) {
  modtagerKloner.innerHTML = "";

  students.forEach(displayStudent);

  // SEARCHBAR
  let search = document.getElementById("search");
  let el = document.querySelectorAll(".grid");

  search.addEventListener("keyup", function() {
    el.forEach(student => {
      if (
        student
          .querySelector(".name")
          .textContent.toLowerCase()
          .includes(search.value.toLowerCase())
      ) {
        student.style.display = "block";
      } else {
        student.style.display = "none";
      }
    });
  });
}

function displayStudent(student) {
  const klon = skabelon.cloneNode(true).content;

  // PREFECT

  let prefectElm = klon.querySelector("[data-field=prefect]");

  if (student.prefect) {
    prefectElm.textContent = "Prefect: " + "☑";
  } else {
    prefectElm.textContent = "Prefect: " + "☐";
  }

  //

  klon.querySelector(".name").textContent = student.firstName + " " + student.lastName;
  klon.querySelector(".house").textContent = student.house;
  document.querySelector(".studentnumber").textContent = "Number of students: " + allStudents.length;

  klon.querySelector("[data-field=prefect]").addEventListener("click", togglePrefect);

  function togglePrefect() {
    clickPrefect(student);
  }

  modtagerKloner.appendChild(klon);

  modtagerKloner.lastElementChild.querySelector(".name").addEventListener("click", () => {
    displayModal(student);
  });
}

function clickPrefect(clickedStudent) {
  console.log("pre");
  const prefects = allStudents.filter(student => {
    return student.prefect === true;
  });

  const prefectsOfHouse = prefects.filter(prefect => {
    return prefect.house === clickedStudent.house;
  });
  // remove prefect if click on a student whos already a prefect
  if (clickedStudent.prefect === true) {
    clickedStudent.prefect = false;
  } else if (prefectsOfHouse) {
    clickedStudent.prefect = true;
  }
  // only let two students of each house be a prefect
  if (prefectsOfHouse.length > 1) {
    clickedStudent.prefect = false;
  } else {
    clickedStudent.prefect = true;
  }
  // set max length of prefects
  if (prefects.length > 7) {
    clickedStudent.prefect = false;
  }

  displayList(allStudents);
}

//

function displayModal(student) {
  document.querySelector("#popup").style.display = "block";
  document.querySelector(".luk").addEventListener("click", skjulPopup);

  document.querySelector("#indhold").dataset.theme = student.house;

  document.querySelector(".name2").textContent = student.firstName + " " + student.lastName;
  document.querySelector(".house2").textContent = student.house;
  document.querySelector(".nickname").textContent = student.nickName;
  document.querySelector(".gender").textContent = student.gender;
  document.querySelector(".photo").src = student.photo;
  document.querySelector(".bloodstatus").textContent = student.blood;

  if (student.prefect === true) {
    document.querySelector(".studentprefect").textContent = "Prefect: Yes";
  } else if (student.prefect === false) {
    document.querySelector(".studentprefect").textContent = "Prefect: No";
  }
  if (student.expelled === false) {
    document.querySelector(".expel").addEventListener("click", expelStudent);
  }

  function expelStudent() {
    clickExpel(student);
  }
}

function skjulPopup() {
  document.querySelector("#popup").style.display = "none";
}

function clickExpel(student) {
  student.expelled = true;
  student.prefect = false;

  currentStudents = allStudents.filter(student => {
    return student.expelled === false;
  });

  expelledStudents.push(student);

  displayList(currentStudents);
  skjulPopup();
}

// FILTERING

function handleFilter() {
  selectedFilter = this.dataset.filter;

  filterArray(selectedFilter);
}

function filterArray(selectedFilter) {
  let filteredArray = [];

  if (selectedFilter == "*") {
    filteredArray = allStudents;
  } else {
    filteredArray = filterStudentsByHouse(selectedFilter);
  }
  if (selectedFilter == "Expelled") {
    filteredArray = expelledStudents;
  }

  displayList(filteredArray);
  document.querySelector(".studentnumber").textContent = "Number of students: " + filteredArray.length;
}

function filterStudentsByHouse(house) {
  console.log(house);
  const result = allStudents.filter(filterFunction);

  function filterFunction(student) {
    if (student.house == house) {
      return true;
    } else {
      return false;
    }
  }
  return result;
}

// SORTING

function sortButtonClick() {
  if (this.dataset.action === "sort") {
    clearAllSort();
    this.dataset.action = "sorted";
  } else {
    if (this.dataset.sortDirection === "asc") {
      this.dataset.sortDirection = "desc";
    } else {
      this.dataset.sortDirection = "asc";
    }
  }
  mySort(this.dataset.sort, this.dataset.sortDirection);
}

function clearAllSort() {
  mySorting.forEach(button => {
    button.dataset.action = "sort";
  });
}

function mySort(sortBy, sortDirection) {
  let desc = 1;
  let currentStudents = allStudents.filter(allStudents => true);

  if (sortDirection === "desc") {
    desc = -1;
  }

  currentStudents.sort(function(a, b) {
    var x = a[sortBy];
    var y = b[sortBy];
    if (x < y) {
      return -1 * desc;
    }
    if (x > y) {
      return 1 * desc;
    }
    return 0;
  });

  displayList(currentStudents);
}
