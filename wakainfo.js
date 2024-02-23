const country = document.querySelector("#country-data");
const submitBtn = document.querySelector(".btn");
const option = document.getElementsByTagName("option");
let map = L.map("map");
let countryCountainer = document.querySelector(".country-container");
const copyright = document.querySelector(".copyright");
console.log(copyright, option);
let closeBtn;
// map = L.map("map").setView(coords, 15);d

const d = new Date();
let year = d.getFullYear();

copyright.innerHTML = `&copy;${year} Wakainfo, All Right Reserved`;

console.log(copyright, option, year);

// LOADMAP
const loadMap = function (position) {
  const { latitude } = position.coords;
  const { longitude } = position.coords;
  const coords = [latitude, longitude];
  map.setView(coords, 5);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  L.marker(coords)
    .addTo(map)
    .bindPopup("A pretty CSS popup.<br> Easily customizable.")
    .openPopup();
};
// RENDER COUNTRY
const renderCountry = function (country, neigb) {
  let currency = Object.getOwnPropertyNames(country.currencies)[0];
  let language = Object.getOwnPropertyNames(country.languages)[0];
  const html = `<article class="country-info">
    <div class="country-image">
      <img src="${country.flags.png}" />
       <button class="close-btn">X</button>
    </div>
    <div class="country-data">
      <h3 class="country-name"><span>Country: </span>${country.name.common}</h3>
      <h3 class="country-capital">
        <span>Capital: </span>${country.capital[0]}
      </h3>
      <h4 class="country-region"><span>Continent: </span>${country.region}</h4>
      <h4 class="neibouring country"><span>Neigbour: </span>${
        // country.borders?.[0] ?? "No neigbours(Island)"
        neigb?.name.common ?? "No neigbours(Island)"
      }</h4>
      <p class="country-row">
        <span>Population: </span>${(+country.population / 1000000).toFixed(
          1
        )} million people
      </p>
      <p class="country-row">
        <span>Currency: </span>${country.currencies[currency].name}
      </p>
      <p class="country-row">
        <span >Language: </span>${country.languages[language]}
      </p>
      <p class="country-row airbnb">Attractions, Hotels and Airbnb
      </p>
      <p class="country-row airbnb">Schools
      </p>
      <p class="country-row airbnb">Hospitals
      </p>
    </div>
   
  </article>`;
  countryCountainer.innerHTML = html;
};

countryCountainer.addEventListener("click", function (e) {
  const element = e.target;
  if (element.className === "close-btn") {
    element.parentElement.parentElement.style.display = "none";
  } else if (element.classList.contains("airbnb")) {
    alert("currently unavailable");
  }
});

// REMDERMARKER
const renderMarker = function (data) {
  map.setView(data.latlng, 5);
  L.marker(data.latlng, 5)
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: true,
        closeOnClick: true,
        className: "marker",
        closeButton: false,
      })
    )
    .setPopupContent(data.capital[0])
    .openPopup();
};

// GET LOACTION
if (navigator.geolocation)
  navigator.geolocation.getCurrentPosition(loadMap, function () {
    alert("Could not get your position");
  });

// COUNTRY DATA REQUEST
let Data;
const getCountryData = function (country) {
  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      Data = data[0];
      // renderMarker(Data);
      // renderCountry(Data);
      let neigbour = Data.borders?.[0];
      // console.log(neigbour);
      if (!neigbour) {
        renderMarker(Data);
        renderCountry(Data);
        return;
      } else {
        return fetch(`https://restcountries.com/v3.1/alpha/${neigbour}`);
      }
    })
    .then((neigbourdata) => {
      return neigbourdata.json();
    })
    .then((neigb) => {
      // console.log(neigb[0].name.common);
      neigb = neigb[0];
      // console.log(neigb);
      renderMarker(Data);
      renderCountry(Data, neigb);
      // console.log(Data);
    })
    .catch((e) => console.error(e));
};

//SUBMIT BTN EVENTLISTNER
submitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  // countryCountainer.style.display = "none";
  const countryData = country.value;
  getCountryData(countryData);
  // console.log(countryData);
  // console.log(map);
  // console.log(Data);
});
// MAP CLICK RENDER COUNTRY
map.on("click", function (mapEvent) {
  // console.log(mapEvent);
  const { lat } = mapEvent.latlng;
  const { lng } = mapEvent.latlng;
  // const coords = { latlng: [lat, lng] };
  // ;
  fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}`)
    .then((data) => data.json())
    .then((data) => {
      // console.log(data);

      if (!data.address) {
        alert("You clicked an Ocean");
        return;
      }
      let clickCountry = data.address.country;

      if (clickCountry === "United States") {
        clickCountry = "United States of America";
      }
      // console.log(clickCountry);
      country.value = clickCountry;
      getCountryData(clickCountry);

      // renderMarker(data);
    });
});

// fetch(`https://restcountries.com/v3.1/name/United States of America`)
//   .then(function (response) {
//     return response.json();
//   })
//   .then((response) => console.log(response));
