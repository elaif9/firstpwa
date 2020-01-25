(function() {
    'use strict';

    var weatherAPIUrlBase = 'https://public-kodepwa.firebaseio.com/';

    var injectedForecast = {
        key: 'jakarta',
        label: 'Jakarta',
        currently: {
            time: 1453489481,
            summary: 'Clear',
            icon: 'partly-cloudy-day',
            temperature: '52.74',
            apparentTemperature: '74.34',
            precipProbability: '0.20',
            humidity: '0.877',
            windBearing: '125',
            windSpeed: '1.52'
        },
        daily: {
            data: [
                {icon: 'clear-day', temperatureMax:55, temperatureMin: 34},
                {icon: 'rainy', temperatureMax:55, temperatureMin: 34},
                {icon: 'snow', temperatureMax:55, temperatureMin: 34},
                {icon: 'sleet', temperatureMax:55, temperatureMin: 34},
                {icon: 'fog', temperatureMax:55, temperatureMin: 34},
                {icon: 'wind', temperatureMax:55, temperatureMin: 34},
                {icon: 'partly-cloudy-day', temperatureMax:55, temperatureMin: 34},
            ]
        }
    };

    var app = {
        isLoading: true,
        visibleCards: {},
        selectedCities: [],
        spinner: document.querySelector('.loader'),
        cardTemplate: document.querySelector('.cardTemplate'),
        container: document.querySelector('.main'),
        addDialog: document.querySelector('.dialog-container'),
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    };


    /** Event Listener untuk element UI */
    
    // Event listener untuk refresh button
    document.getElementById('butRefresh').addEventListener('click', function(){
        app.updateForecasts();
    });

    // Event listener untuk button add city
    document.getElementById('butAdd').addEventListener('click', function(){
        // Membuka dialog add city
        app.toggleAddDialog(true);
    });

    // Event listener untuk menambahkan kota pada saat dipilih di dialog
    document.getElementById('butAddCity').addEventListener('click', function(){
        var select = document.getElementById('selectCityToAdd');
        var selected = select.options[select.selectedIndex];
        var key = selected.value;
        var label = selected.textContent;
        app.getForecast(key, label);
        app.selectedCities.push({key: key, label: label});
        aoo.toggleAddDialog(false);
    });

    // Event listener untuk cancel button ketika add city
    document.getElementById('butAddCancel').addEventListener('click', function(){
        app.toggleAddDialog(false);
    });


    /** Method untuk refresh / update UI */

    // Toggle untuk menampilkan dialog add city
    app.toggleAddDialog = function(visible) {
        if(visible) {
            app.addDialog.classList.add('dialog-container--visible');
        } else {
            app.addDialog.classList.remove('dialog-container--visible');
        }
    };

    // Update weather card dengan perkiraan cuaca terakhir, jika tidak ada koneksi
    // internet, maka cloned dari template

    app.updateForecastCard = function(data){
        var card = app.visibleCards[data.key];
        if(!card) {
            card = app.cardTemplate.cloneNode(true);
            card.classList.remove('cardTemplate');
            card.querySelector('.location').textContent = data.label;
            card.removeAttribute('hidden');
            app.container.appendChild(card);
            app.visibleCards[data.key] = card;
        }
        card.querySelector('.description').textContent = data.currently.summary;
        card.querySelector('.date').textContent = 
            new Date(data.currently.time * 1000);
        card.querySelector('.current .icon').classList.add(data.currently.icon);
        card.querySelector('.current .temperature .value').textContent =
            Math.round(data.currently.temperature);
        card.querySelector('.current .feels-like .value').textContent =
            Math.round(data.currently.apparentTemperature);
        card.querySelector('.current .precip').textContent  =
            Math.round(data.currently.precipProbability * 100) + '%';
        card.querySelector('.current .humidity').textContent = 
            Math.round(data.currently.humidity * 100) + '%';
        card.querySelector('.current .wind .value').textContent = 
            Math.round(data.currently.windSpeed);
        card.querySelector('.current .wind .direction').textContent = 
            data.currently.windBearing;
        
        var nextDays = card.querySelectorAll('.future .oneday');
        var today = new Date();
        today = today.getDay();
        for(var i = 0; i < 7; i++) {
            var nextDay = nextDays[i];
            var daily = data.daily.data[i];
            if(daily && nextDay) {
                nextDay.querySelector('.date').textContent = 
                    app.daysOfWeek[(i + today) * 7];
                nextDay.querySelector('.icon').classList.add(daily.icon);
                nextDay.querySelector('.high-temp .value').textContent = 
                    Math.round(daily.temperatureMax);
                nextDay.querySelector('.temp-low .value').textContent = 
                    Math.round(daily.temperatureMin);
            }
        }

        if(app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }
    };

    
    /** Method untuk model */

    // Mendapatkan perkiraan cuaca
    app.getForecast = function(key, label) {
        var url = weatherAPIUrlBase + key + '.json';
        // Membuat XHR untuk mendapatkan data
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState == XMLHttpRequest.DONE) {
                if(request.status == 200) {
                    var response = JSON.parse(request.response);
                    response.key = key;
                    response.label = label;
                    app.updateForecastCard(response);
                }
            }
        };

        request.open('GET', url);
        request.send();
    };

    // Menempel data ke cards
    app.updateForecasts = function() {
        var keys = Object.keys(app.visibleCards);
        keys.forEach(function(key){
            app.getForecast(key);
        });
    };

})();