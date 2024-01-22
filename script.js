const userTab = document.querySelector("[data-user-weather]");
const searchTab = document.querySelector("[data-search-weather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-search-form]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

let oldTab = userTab;
const API_KEY = "168771779c71f3d64106d8a88376808a";
oldTab.classList.add("current-tab");
getfromSessionStorage();    //checks if latitude and longitutde are already present in session storage or not

function switchTab(newTab) {
    if(newTab != oldTab){
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            //If searchForm container is invisible . If yes then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            //main pehle search wale tab par tha , ab  your weather tab  visible karna hai 
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //now we're in weather tab so we have to display it . so let's check local storage first
            //for coordinates,if we have saved them there.
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener('click',() =>{
    //pass clicked tab as input parameter
    switchTab(userTab); 
});

searchTab.addEventListener('click',() =>{
    //pass clicked tab as input parameter
    switchTab(searchTab); 
});

//check if coordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        //if local coordinates are not present
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    //make grant access container invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API CALL
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await res.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeaherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
    }
}

function renderWeaherInfo(weatherInfo) {
    //firstly, we have to fetch the elements
    const cityName = document.querySelector("[data-city-name]");
    const countryIcon = document.querySelector("[data-country-icon]");
    const desc = document.querySelector("[data-weather-des]");
    const weatherIcon = document.querySelector("[data-weather-icon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatheInfo object and put it UI elements
    cityName.innerText   = weatherInfo?.name;   //chaining operator
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation() {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        alert("No Geo Location Support Available !")
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
const grantAccessButton = document.querySelector("[data-grant-access]");
grantAccessButton.addEventListener('click', getLocation);

let searchInput = document.querySelector("[data-search-input]");

searchForm.addEventListener('submit',(e) =>{
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "") { 
        return;
    }
    else {
        fetchSearchWeatherInfo(cityName);
    }
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );        
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeaherInfo(data);
    }
    catch(err){
        alert("404 Data Not Found")
    }
}  