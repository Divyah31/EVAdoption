document.addEventListener('DOMContentLoaded', function() {
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    const calculateDistanceButton = document.getElementById('calculateDistance');
    const distanceResult = document.getElementById('distanceResult');
    const calculatedDistanceSpan = document.getElementById('calculatedDistance');
    const tripTypeSelect = document.getElementById('tripType');
    const proceedToStep2Button = document.getElementById('proceed-to-step2');
    const proceedToStep3Button = document.getElementById('proceed-to-step3');
    const minBudgetSelect = document.getElementById('minBudget');
    const maxBudgetSelect = document.getElementById('maxBudget');
    const budgetRangeDisplay = document.getElementById('budgetRangeDisplay');
    const finishButton = document.getElementById('finish');


    // Autocomplete 
    const autocompleteOptions = {
        componentRestrictions: { country: 'au' },  
        bounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(-38.433859, 144.593741),  
            new google.maps.LatLng(-37.511274, 145.512528)   
        ),
        strictBounds: true
    };

    // Initialize Google Maps Autocomplete
    const originAutocomplete = new google.maps.places.Autocomplete(originInput, autocompleteOptions);
    const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput, autocompleteOptions);

    calculateDistanceButton.addEventListener('click', function() {
        
        calculateAndDisplayDistance();
        const origin = originInput.value;
        const destination = destinationInput.value;

        if (origin && destination) {
            const service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix(
                {
                    origins: [origin],
                    destinations: [destination],
                    travelMode: 'DRIVING',
                    unitSystem: google.maps.UnitSystem.METRIC,
                }, callback);
        } else {
            alert('Please enter both origin and destination addresses.');
        }
    });

    function callback(response, status) {
        if (status == 'OK') {
            const distance = response.rows[0].elements[0].distance.text;
            const numericDistance = parseFloat(distance.replace(' km', ''));
            const factor = tripTypeSelect.value === 'roundTrip' ? 2 : 1;
            const updatedDistance = (numericDistance * factor).toFixed(2);
            calculatedDistanceSpan.textContent = `${updatedDistance} km`;
            distanceResult.style.display = 'block';
            proceedToStep2Button.disabled = false;
        } else {
            alert('Error: ' + status);
        }
    }

    tripTypeSelect.addEventListener('change', function() {
        updateDistance();
        if (distanceResult.style.display !== 'none') {
            calculateAndDisplayDistance();
        }
    });

    function calculateAndDisplayDistance() {
        const origin = originInput.value;
        const destination = destinationInput.value;
    
        if (origin && destination) {
            const service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix(
                {
                    origins: [origin],
                    destinations: [destination],
                    travelMode: 'DRIVING',
                    unitSystem: google.maps.UnitSystem.METRIC,
                }, callback);
        }
    }

    function updateDistance() {
        const distanceText = calculatedDistanceSpan.textContent;
        const distance = parseFloat(distanceText.replace(' km', ''));
        if (!isNaN(distance)) {
            const factor = tripTypeSelect.value === 'roundTrip' ? 2 : 1;
            const updatedDistance = (distance * factor).toFixed(2);
            calculatedDistanceSpan.textContent = `${updatedDistance} km`;
        }
    }

    // Step 1: Weekday range
    proceedToStep2Button.addEventListener('click', function() {
        if (distanceResult.style.display !== 'none') {
            navigateToStep(1, 2);
        } else {
            alert('Please calculate the distance first.');
        }
    });

    // Step 2: Car preferences
    const preferenceList = document.getElementById('preferenceList');
    let draggedItem = null;

    preferenceList.addEventListener('dragstart', function(e) {
        draggedItem = e.target.closest('.preference-option');
        setTimeout(() => {
            draggedItem.classList.add('dragging');
        }, 0);
    });

    preferenceList.addEventListener('dragend', function(e) {
        setTimeout(() => {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
            updatePreferenceOrder();
        }, 0);
    });

    preferenceList.addEventListener('dragover', function(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(preferenceList, e.clientY);
        if (afterElement == null) {
            preferenceList.appendChild(draggedItem);
        } else {
            preferenceList.insertBefore(draggedItem, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.preference-option:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function updatePreferenceOrder() {
        const preferences = Array.from(preferenceList.children);
        preferences.forEach((item, index) => {
            const numberElement = item.querySelector('.preference-number');
            if (numberElement) {
                numberElement.textContent = index + 1;
            }
        });
        console.log('Updated preferences order:', preferences.map(p => p.dataset.preference));
    }

    function getSelectedPreferences() {
        return Array.from(document.querySelectorAll('.preference-option')).map(option => option.dataset.preference);
    }

    proceedToStep3Button.addEventListener('click', () => navigateToStep(2, 3));

    // Step 3: Budget
    const budgetOptions = [30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 200, 300, 500];
      
    budgetOptions.forEach(value => {
        minBudgetSelect.add(new Option(`${value}K`, value));
        maxBudgetSelect.add(new Option(`${value}K`, value));
    });

    minBudgetSelect.value = budgetOptions[0];
    maxBudgetSelect.value = budgetOptions[budgetOptions.length - 1];

    // Update budget display and enforce validation
    function updateBudgetDisplay() {
        const minBudget = parseInt(minBudgetSelect.value);
        const maxBudget = parseInt(maxBudgetSelect.value);

        if (maxBudget <= minBudget) {
            maxBudgetSelect.setCustomValidity('Maximum budget cannot be less than minimum budget.');
            maxBudgetSelect.reportValidity();
            proceedToStep3Button.disabled = true;  // Disable the next step button
        } else {
            maxBudgetSelect.setCustomValidity('');
            proceedToStep3Button.disabled = false;  // Enable the next step button if valid
        }

        budgetRangeDisplay.textContent = `${minBudget}K - ${maxBudget}K`;
    }

    minBudgetSelect.addEventListener('change', updateBudgetDisplay);
    maxBudgetSelect.addEventListener('change', updateBudgetDisplay);

    updateBudgetDisplay();

    // Navigation
    function navigateToStep(fromStep, toStep) {
        console.log(`Navigating from step ${fromStep} to step ${toStep}`);
        
        const fromElement = document.getElementById(`step${fromStep}-content`);
        if (fromElement) fromElement.style.display = 'none';
        
        const toElement = document.getElementById(`step${toStep}-content`);
        if (toElement) toElement.style.display = 'block';
        
        if (toStep < 4) {
            document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
            
            const sidebarElement = document.getElementById(`sidebar-step${toStep}`);
            if (sidebarElement) {
                sidebarElement.classList.add('active');
            } else {
                console.warn(`Sidebar element for step ${toStep} not found`);
            }
        }
    }

    // Back buttons
    document.getElementById('back-to-step1').addEventListener('click', () => navigateToStep(2, 1));
    document.getElementById('back-to-step2').addEventListener('click', () => navigateToStep(3, 2));

    // Finish and submit
    finishButton.addEventListener('click', function () {
        navigateToStep(3, 4);
        document.getElementById('loadingSpinner').style.display = 'block';
        
        setTimeout(() => {
            const distanceText = calculatedDistanceSpan.textContent;
            const distance = parseFloat(distanceText.replace(' km', ''));
            const userData = {
                weekdayRange: distance || 0,
                weekdayTripType: tripTypeSelect.value,
                preferences: getSelectedPreferences(),
                minBudget: parseInt(minBudgetSelect.value),
                maxBudget: parseInt(maxBudgetSelect.value)
            };
        
            console.log('Sending data to backend:', userData);

            fetch('/api/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            })
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('evRecommendations', JSON.stringify(data));
                window.location.href = '/recommendation_details';
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred while fetching recommendations. Please try again.');
            });
        }, 2000);
    });
});