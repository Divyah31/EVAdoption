document.addEventListener('DOMContentLoaded', function() {
    let carsDisplayed = 5; 
    let totalCars = 0; 

    let recommendations;
    try {
        recommendations = JSON.parse(localStorage.getItem('evRecommendations'));
    } catch (e) {
        console.error('Error parsing recommendations:', e);
        recommendations = null;
    }
    
    if (!recommendations || recommendations.length === 0 || (typeof recommendations === 'object' && recommendations.message)) {
        displayNoResultsMessage(recommendations && recommendations.message ? recommendations.message : 'No vehicles match your criteria. Please try adjusting your preferences.');
    } else {
        displayCars(recommendations);
        setupSorting();
        setupPriceFilter();
    }

    function displayCars(cars) {
        totalCars = cars.length;
        updateCarGrid(cars.slice(0, carsDisplayed));
        populateTypeSelect(cars);
    
        const typeSelect = document.getElementById('typeSelect');
        typeSelect.addEventListener('change', function() {
            filterAndDisplayCars();
        });


        if (totalCars > carsDisplayed) {
            createShowMoreButton(cars);
        }
    }

    function createShowMoreButton(cars) {
        const showMoreButton = document.createElement('button');
        showMoreButton.id = 'showMoreButton';
        showMoreButton.textContent = 'show more';
        showMoreButton.style.display = 'block';
        showMoreButton.style.margin = '40px auto';
        showMoreButton.className = 'show-more-button';

        showMoreButton.addEventListener('click', function() {
            carsDisplayed = totalCars; 
            updateCarGrid(cars); 
            showMoreButton.style.display = 'none';
        });

        document.querySelector('main').appendChild(showMoreButton); 
    }

    function updateCarGrid(cars) {
        const carGrid = document.getElementById('carGrid');
        carGrid.innerHTML = ''; 
        cars.forEach(car => {
            const carCard = createCarCard(car);
            carGrid.appendChild(carCard); 
        });
        document.getElementById('carsAvailable').textContent = `${cars.length} cars available`;
    }

    function createCarCard(car) {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        const price = car.listed_price_aud ? car.listed_price_aud.toLocaleString() : "N/A";
        carCard.innerHTML = `
            <div class="car-card-header">
                <img src="${car.image_url}" alt="${car.model}" onerror="this.src='/static/images/ev/default.jpg'">
                <div class="match-percentage">${car.matchPercentage}% MATCH</div>
            </div>
            <div class="car-info">
                <h3>${car.model}</h3>
                <p class="variant">${car.variant_details || ''}</p>
                <div class="car-details">
                    <div class="detail"><span>Type:</span><span>${car.type_name || 'N/A'}</span></div>
                    <div class="detail"><span>Range:</span><span>${car.range_km || 'N/A'} km</span></div>
                    <div class="detail"><span>Energy:</span><span>${car.energy_consumption_kwh_per_100km || 'N/A'} kWh/100km</span></div>
                    <div class="detail"><span>Fast Charge:</span><span>${car.fast_charge_time_minutes || 'N/A'} min</span></div>
                </div>
                <div class="car-price">
                    <span>AUD ${price}</span>
                    <span class="availability">Available Now</span>
                </div>
            </div>
        `;
        return carCard;
    }

    function filterAndDisplayCars() {
        let cars = JSON.parse(localStorage.getItem('evRecommendations'));
        const selectedType = document.getElementById('typeSelect').value;
        const minPrice = Number(document.getElementById('priceSliderMin').value);
        const maxPrice = Number(document.getElementById('priceSliderMax').value);
        const sortBy = document.getElementById('sortSelect').value;

        cars = cars.filter(car => 
            (selectedType === 'all' || car.type_name === selectedType) &&
            car.listed_price_aud >= minPrice &&
            car.listed_price_aud <= maxPrice
        );

        cars = sortCars(cars, sortBy);

        carsDisplayed = 5; 
        updateCarGrid(cars.slice(0, carsDisplayed)); 

     
        const showMoreButton = document.getElementById('showMoreButton');
        if (cars.length > carsDisplayed) {
            showMoreButton.style.display = 'block';
            showMoreButton.onclick = () => {
                carsDisplayed = cars.length; 
                updateCarGrid(cars);
                showMoreButton.style.display = 'none'; 
            };
        } else {
            showMoreButton.style.display = 'none'; 
        }
    }

    function sortCars(cars, sortBy) {
        switch(sortBy) {
            case 'matchPercentage':
                return cars.sort((a, b) => b.matchPercentage - a.matchPercentage);
            case 'price':
                return cars.sort((a, b) => (a.listed_price_aud || 0) - (b.listed_price_aud || 0));
            case 'range':
                return cars.sort((a, b) => (b.range_km || 0) - (a.range_km || 0));
            case 'energyConsumption':
                return cars.sort((a, b) => (a.energy_consumption_kwh_per_100km || 0) - (b.energy_consumption_kwh_per_100km || 0));
            case 'fastCharge':
                return cars.sort((a, b) => (a.fast_charge_time_minutes || 0) - (b.fast_charge_time_minutes || 0));
            default:
                return cars;
        }
    }

    function setupSorting() {
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                filterAndDisplayCars();
            });
        }
    }

    function setupPriceFilter() {
        const minSlider = document.getElementById('priceSliderMin');
        const maxSlider = document.getElementById('priceSliderMax');
        const minPriceDisplay = document.getElementById('minPriceDisplay');
        const maxPriceDisplay = document.getElementById('maxPriceDisplay');

        function updateSliderRange(min, max) {
            minSlider.value = min;
            maxSlider.value = max;
            minPriceDisplay.textContent = Number(min).toLocaleString();
            maxPriceDisplay.textContent = Number(max).toLocaleString();
            updateSliderColors();
        }

        function updateSliderColors() {
            const percent1 = ((minSlider.value - minSlider.min) / (minSlider.max - minSlider.min)) * 100;
            const percent2 = ((maxSlider.value - minSlider.min) / (minSlider.max - minSlider.min)) * 100;
            document.querySelector('.slider-track').style.background = 
                `linear-gradient(to right, #ddd ${percent1}%, #4CAF50 ${percent1}%, #4CAF50 ${percent2}%, #ddd ${percent2}%)`;
        }

        minSlider.addEventListener('input', function() {
            let minValue = parseInt(minSlider.value);
            let maxValue = parseInt(maxSlider.value);
            
            if (minValue > maxValue) {
                minValue = maxValue;
                minSlider.value = minValue;
            }
            
            updateSliderRange(minValue, maxValue);
            filterAndDisplayCars();
        });

        maxSlider.addEventListener('input', function() {
            let minValue = parseInt(minSlider.value);
            let maxValue = parseInt(maxSlider.value);
            
            if (maxValue < minValue) {
                maxValue = minValue;
                maxSlider.value = maxValue;
            }
            
            updateSliderRange(minValue, maxValue);
            filterAndDisplayCars();
        });

        
        updateSliderRange(minSlider.value, maxSlider.value);
    }

    function displayNoResultsMessage(message) {
        const mainContent = document.querySelector('main') || document.body;
        mainContent.innerHTML = `
            <div class="results">
                <div class="results-header">
                    <h2 id="carsAvailable">0 cars available</h2>
                </div>
                <div id="carGrid" class="car-grid">
                    <div class="no-results-message">
                        ${message}
                    </div>
                </div>
            </div>
        `;
    }

    function populateTypeSelect(cars) {
        const typeSelect = document.getElementById('typeSelect');
        const types = ['all', ...new Set(cars.map(car => car.type_name))];
        typeSelect.innerHTML = types.map(type => 
            `<option value="${type}">${type === 'all' ? 'All Types' : type}</option>`
        ).join('');
    }
});
