

const alarm = {};

// API variables /////////////////////////////////////////////////////////////
alarm.sunriseBaseUrl = "https://api.sunrise-sunset.org/json";
// --------------------------------------------------------------- //
alarm.geocodeBaseUrl = "https://api.opencagedata.com/geocode/v1/json";
alarm.geocodeApiKey = "f3bae0e7b1f547319d38397ca83b0718";
// --------------------------------------------------------------- //
alarm.weatherBaseUrl = "https://api.weatherbit.io/v2.0/current";
alarm.weatherApiKey = "c9dfc833aa69408d87bc19a31bfe307f";

// html variables /////////////////////////////////////////////////////////////
alarm.main = $("main");
alarm.landingPage = $(".landingPage");
//
alarm.cityPage = $(".cityPage");
alarm.cityForm = $(".cityPage form");
alarm.text = $(":text");
//
alarm.wakeTime = $(".wakeTime");
alarm.firstLight = $(".firstLight");
alarm.sunrise = $(".sunrise");
//
alarm.suggestions = $(".suggestions");
alarm.bed = $(".bed");
alarm.bedtime = $(".bedtime");
alarm.bedButton = $(".bedButton")
alarm.bedtimeA = $(".firstLightBedtime");
alarm.bedtimeB = $(".sunriseBedtime");
//
alarm.timer = $(".timer");
//
alarm.endPage = $(".endPage");
alarm.weather = $(".weather");
alarm.tips = $(".tips");
alarm.endButton = $(".endButton");
/////////////////////////////////////////////////////////////////////////////

// access to geocoding API
alarm.geocodeApi = function(city) {
    const geocodePromise = $.ajax({
        url: alarm.geocodeBaseUrl, 
        method: "GET",
        dataType: "json",
        data: {
            key: alarm.geocodeApiKey,
            q: city,
        },
    }).fail(function(error) {
        console.log(error);
    });

    return geocodePromise
};

// sunrise-sunset API
alarm.sunriseApi = function(latitude, longitude) {
    const sunrisePromise = $.ajax({
        url: alarm.sunriseBaseUrl, 
        method: "GET",
        dataType: "json",
        data: {
            lat: latitude,
            lng: longitude,
            date: "tomorrow",
        },
    }).then(function(sunData) {
        // recommended bedtime variables
        let timeA = sunData.results.nautical_twilight_begin.split(":");
        let timeB = sunData.results.sunrise.split(":");
        let hour;
        let min;
        let amPm;
        // calculate bedtime recommendations
        function subtractTime(h, m, t){
            hour = parseInt(t[0]);
            min = parseInt(t[1]);
            // converting UTC to EST, future can convert to country user is in
            if(hour - 4 >= 0){
                hour = hour - 4;
            }else{
                hour = hour + 8;
            }
            // changing waketime to optimal bedtime
            if(min - m >= 1){
                min = min - m;
            }else{
                min = min + 60-m;
                hour--;
            }
            if(hour - h >= 0){
                hour = hour - h;
                if(hour === 0){
                    hour = 12;
                }
                amPm = "AM"
            }else{
                hour = hour + 12 - h;
                
                amPm = "PM"
            }
            if(min <= 9) {
                min = `0${min}`
            }
            if(hour <= 9) {
                hour = `0${hour}`
            }
            // returning time as a string
            return `${hour}:${min} ${amPm}`
        };

        // first light ////////
        time0 = `${hour}:${min} ${amPm}`
        // optimal
        time1 = subtractTime(9, 15, timeA);
        time2 = subtractTime(7, 45, timeA);
        // less optimal
        time3 = subtractTime(10, 45, timeA);
        time4 = subtractTime(6, 15, timeA);
        
        // sunrise ////////////
        time10 = `${hour}:${min} ${amPm}`
        // optimal
        time11 = subtractTime(9, 15, timeB);
        time12 = subtractTime(7, 45, timeB);
        // less optimal
        time13 = subtractTime(10, 45, timeB);
        time14 = subtractTime(6, 15, timeB);

        // fill in the blank for first light div
        alarm.firstLight.on("click", function() {
            alarm.wakeTime.hide();
            alarm.bedtime.html(`
            <h2>
                recommended bedtime for optimal sleep
            </h2>
            <div class="ideal">
                <h3 class="time1">
                    ${time1}
                </h3>
                <h3 class="time2">
                    ${time2}
                </h3>
            </div>
            <h2 class="specialH2">
                the suboptimal replacement
            </h2>
            <div class="lessIdeal">
                <h3 class="time3">
                    ${time3}
                </h3>
                <h3 class="time4">
                    ${time4}
                </h3>
            </div>
            <button class="bedButton">
                click here to set alarm
            </button>
            `);
            alarm.bed.show();
        });
        alarm.sunrise.on("click", function() {
            //alarm.sunrise.hide();
            alarm.wakeTime.hide();
            alarm.bedtime.html(`
            <h2>
                recommended bedtime for optimal sleep
            </h2>
            <div class="ideal">
                <h3 class="time1">
                    ${time11}
                </h3>
                <h3 class="time2">
                    ${time12}
                </h3>
            </div>
            <h2 class="specialH2">
                if you miss the optimal timing, this is a suboptimal replacement
            </h2>
            <div class="lessIdeal">
                <h3 class="time3">
                    ${time13}
                </h3>
                <h3 class="time4">
                    ${time14}
                </h3>
            </div>
            <button class="bedButton">
                click here to set alarm
            </button>
            `);
            alarm.bed.show();
        });

    }).fail(function(error) {
        // console.log("sunrise failed");
        // console.log(error);
        alert(error.status);
    });

    return sunrisePromise
};

// weather API
alarm.weatherApi = function(latitude, longitude) {
    const weatherPromise = $.ajax({
        url: alarm.weatherBaseUrl, 
        method: "GET",
        dataType: "json",
        data: {
            key: alarm.weatherApiKey,
            lat: latitude,
            lon: longitude,
        },
    }).then(function(weatherData){
        console.log(weatherData);
        const weather = weatherData.data[0].temp;
        const rain = weatherData.data[0].precip;
        const snow = weatherData.data[0].snow;
        const clear = weatherData.data[0].weather.description;

        alarm.weather.html(`
            <h3>
                ❤ good morning ❤
            </h3>
            <h2>
                It is ${weather}°C outside.
            </h2>
        `);
        if (rain > 0) {
            alarm.tips.html(`
                <img src="./styles/assets/rain.png" alt="Don't forget to bring an umbrella!">
            `)
        }else if (snow > 0) {
            alarm.tips.html(`
                <img src="./styles/assets/snow.png" alt="It's snowing outside!">
            `)
        }else if (clear.includes("clear") || clear.includes("Clear")) {
            alarm.tips.html(`
                <img src="./styles/assets/sunny.png" alt="Don't forget to wear sunglasses">
            `)
        }else if (weather <= 0) {
            alarm.tips.html(`
                <img src="./styles/assets/cold.png" alt="Don't forget to bring a jacket!">
            `)
        }else {
            alarm.tips.html(`
                <p>
                    "The future is bright my friend!"
                </p>
            `)
        }
    }).fail(function(error) {
        // console.log("weather failed");
        // console.log(error);
        alert(error.status);
    });

    return weatherPromise
};

// using geoCode to access the weather and daytime for city of choice 
alarm.callApi = function () {
    const location = alarm.geocodeApi(alarm.text.val());
    
    $.when(location).done(function(geoData) {
        const latitude = geoData.results[0].geometry.lat;
        const longitude = geoData.results[0].geometry.lng;
        alarm.sunriseApi(latitude, longitude);
        alarm.weatherApi(latitude, longitude);
        
    });
};


// to be continued TT_TT
// alarm.hour;
// alarm.min;

// alarm.timer = function () {
//     setInterval(function() {
//         let hourDisplayed = alarm.hour;
//         let minDisplayed = alarm.min;

//         alarm.min = Number(alarm.min) + 1;
//         alarm.min = "" + flagApp.min + "";

//         if (Number(alarm.min) === 0) {
            
//         }else if() {

//         }else {

//             alarm.timer.html(timeDisplayed);
//         }
//     }, 60000); 
// }


// events to reach the next page
alarm.landingPage.on("click", function() {
    alarm.landingPage.hide();
    alarm.cityPage.show();
});

alarm.cityForm.on("submit", function(e) {
    e.preventDefault();
    alarm.geocodeApi(alarm.text.val());
    alarm.callApi();
    $(".cityPage").hide();
    alarm.wakeTime.show();
});

alarm.bed.on("click", alarm.bedButton, function() {
    alarm.bed.hide();
    alarm.endPage.show();
});

alarm.endButton.on("click", function() {
    alarm.text.val("");
    alarm.endPage.hide();
    alarm.landingPage.show();
});

// load the first page
alarm.init = function() {
    alarm.landingPage.show();
    alarm.text.val("");
};
// document ready
$(function(){
    alarm.init();
});





