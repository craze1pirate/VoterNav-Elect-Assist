/**
 * VoterNav - App Logic
 * Handles the 3-step wizard navigation, eligibility validation, and UI updates.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let currentStep = 1;
    const totalSteps = 3;

    // --- DOM Elements ---
    // Sections
    const steps = document.querySelectorAll('.wizard-step');
    
    // Progress Indicators
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const progressBar = document.getElementById('progress-bar');
    
    // Navigation Buttons
    const btnNext = document.getElementById('btn-next');
    const btnBack = document.getElementById('btn-back');

    // Step 1: Eligibility Form Elements
    const ageInput = document.getElementById('age');
    const citizenshipRadios = document.getElementsByName('citizenship');
    const eligibilityMessage = document.getElementById('eligibility-message');

    // --- Initialization ---
    updateUI();

    // --- Event Listeners ---

    // Next Button Click
    btnNext.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateUI();
        } else {
            // Reached the end of the wizard
            alert('Wizard completed! This would typically submit data or finish the setup.');
        }
    });

    // Back Button Click
    btnBack.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateUI();
        }
    });

    // Step 1: Real-time validation listeners
    ageInput.addEventListener('input', checkEligibility);
    citizenshipRadios.forEach(radio => radio.addEventListener('change', checkEligibility));

    // Step 3: Find Booth Button
    const btnFindBooth = document.getElementById('btn-find-booth');
    const zipcodeInput = document.getElementById('zipcode');
    const pollingResultDiv = document.getElementById('polling-result');

    if (btnFindBooth && zipcodeInput && pollingResultDiv) {
        btnFindBooth.addEventListener('click', async () => {
            const zipCode = zipcodeInput.value.trim();
            
            if (!zipCode) {
                pollingResultDiv.innerHTML = `<div class="p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 text-sm font-medium">Please enter a ZIP code.</div>`;
                return;
            }

            // Set loading state
            const originalBtnText = btnFindBooth.innerHTML;
            btnFindBooth.innerHTML = 'Searching...';
            btnFindBooth.disabled = true;
            btnFindBooth.classList.add('opacity-75', 'cursor-not-allowed');
            pollingResultDiv.innerHTML = '';

            try {
                const data = await fetchPollingLocation(zipCode);
                
                if (data && data.pollingLocations && data.pollingLocations.length > 0) {
                    const location = data.pollingLocations[0];
                    pollingResultDiv.innerHTML = `
                        <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-all duration-300">
                            <div class="flex items-start gap-4">
                                <div class="bg-indigo-100 p-3 rounded-full text-indigo-600 flex-shrink-0">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </div>
                                <div>
                                    <h4 class="font-bold text-gray-900 text-lg">${location.address.locationName}</h4>
                                    <p class="text-gray-600 mt-1">${location.address.line1}<br>${location.address.city}</p>
                                    <div class="mt-3 inline-flex items-center text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                                        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Hours: ${location.pollingHours}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    pollingResultDiv.innerHTML = `
                        <div class="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 text-sm font-medium flex items-center">
                            <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>
                            No polling location found for this ZIP. Please try 12345 for the demo.
                        </div>
                    `;
                }
            } catch (error) {
                pollingResultDiv.innerHTML = `<div class="p-4 bg-red-50 text-red-800 rounded-lg border border-red-200 text-sm font-medium">An error occurred while searching.</div>`;
            } finally {
                // Reset loading state
                btnFindBooth.innerHTML = originalBtnText;
                btnFindBooth.disabled = false;
                btnFindBooth.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        });
    }

    // Step 3: Calendar Reminder Button
    const btnRemindMe = document.getElementById('btn-remind-me');
    if (btnRemindMe) {
        btnRemindMe.addEventListener('click', () => {
            const title = '🗳️ Election Day - Time to Vote!';
            const details = 'Remember to bring your valid Voter ID or recognized identification to the polling booth. Check VoterNav for your exact booth location!';
            const dates = getNextTuesdayEventDates();
            
            const calendarUrl = generateGoogleCalendarLink(title, details, dates);
            window.open(calendarUrl, '_blank');
        });
    }


    // --- Core Functions ---

    /**
     * Updates the entire UI based on the `currentStep` state.
     * Manages section visibility, progress bar, indicators, and buttons.
     */
    function updateUI() {
        // 1. Update Step Content Visibility
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            if (stepNumber === currentStep) {
                step.classList.remove('hidden');
                // Re-trigger animation by removing and re-adding a class if needed, 
                // but standard CSS animation on display:block usually suffices for simple setups.
            } else {
                step.classList.add('hidden');
            }
        });

        // 2. Update Progress Bar Width
        // Calculates percentage based on current step relative to total steps
        const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // 3. Update Step Indicators (the circular numbers)
        stepIndicators.forEach((indicator, index) => {
            const stepNum = index + 1;
            
            // Base classes for the indicator circle
            let classes = 'step-indicator w-10 h-10 rounded-full font-bold border-4 shadow flex items-center justify-center transition-all duration-300 z-10 ';

            if (stepNum < currentStep) {
                // Completed step styling
                indicator.className = classes + 'bg-indigo-600 text-white border-white';
                indicator.setAttribute('aria-current', 'false');
            } else if (stepNum === currentStep) {
                // Current active step styling
                indicator.className = classes + 'bg-indigo-600 text-white border-indigo-200 ring-2 ring-indigo-100 ring-offset-2';
                indicator.setAttribute('aria-current', 'step');
            } else {
                // Future step styling
                indicator.className = classes + 'bg-gray-200 text-gray-500 border-white';
                indicator.setAttribute('aria-current', 'false');
            }
        });

        // 4. Update Navigation Buttons
        // Back button visibility
        if (currentStep === 1) {
            btnBack.classList.add('hidden');
        } else {
            btnBack.classList.remove('hidden');
        }

        // Next button text and styling
        if (currentStep === totalSteps) {
            btnNext.textContent = 'Done';
            btnNext.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
            btnNext.classList.add('bg-green-600', 'hover:bg-green-700', 'focus:ring-green-300');
        } else {
            btnNext.textContent = 'Next Step';
            btnNext.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
            btnNext.classList.remove('bg-green-600', 'hover:bg-green-700', 'focus:ring-green-300');
        }
    }

    /**
     * Checks user eligibility based on Age and Citizenship inputs.
     * Displays a success or warning message dynamically.
     */
    function checkEligibility() {
        const ageStr = ageInput.value.trim();
        const age = parseInt(ageStr, 10);
        
        let isCitizen = null;
        for (const radio of citizenshipRadios) {
            if (radio.checked) {
                isCitizen = radio.value === 'yes';
                break;
            }
        }

        // Only evaluate and show message if both inputs have been provided
        if (ageStr !== '' && !isNaN(age) && isCitizen !== null) {
            eligibilityMessage.classList.remove('hidden');
            
            if (age >= 18 && isCitizen) {
                // Success state
                eligibilityMessage.innerHTML = `
                    <div class="flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                        Great news! You are eligible to vote.
                    </div>
                `;
                eligibilityMessage.className = 'p-4 rounded-lg mt-6 font-medium bg-green-50 text-green-800 border border-green-200 transition-all duration-300';
            } else {
                // Warning state
                let reason = [];
                if (age < 18) reason.push('you must be 18 years or older');
                if (!isCitizen) reason.push('you must be a citizen');
                
                eligibilityMessage.innerHTML = `
                    <div class="flex items-start">
                        <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>
                        <div>
                            <span class="block font-bold">Not eligible at this time</span>
                            <span class="text-sm font-normal mt-1 block">Currently, ${reason.join(' and ')} to vote.</span>
                        </div>
                    </div>
                `;
                eligibilityMessage.className = 'p-4 rounded-lg mt-6 font-medium bg-red-50 text-red-800 border border-red-200 transition-all duration-300';
            }
        } else {
            // Hide message if inputs are cleared or incomplete
            eligibilityMessage.classList.add('hidden');
        }
    }

    /**
     * Generates a Google Calendar Event URL
     */
    function generateGoogleCalendarLink(title, details, dates) {
        const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
        const encodedTitle = encodeURIComponent(title);
        const encodedDetails = encodeURIComponent(details);
        const encodedDates = encodeURIComponent(dates);
        
        return `${baseUrl}&text=${encodedTitle}&details=${encodedDetails}&dates=${encodedDates}`;
    }

    /**
     * Gets the next upcoming Tuesday formatted as YYYYMMDDTHHMMSSZ
     * using the requested 08:00 AM to 06:00 PM time block.
     */
    function getNextTuesdayEventDates() {
        const date = new Date();
        const daysUntilTuesday = (2 - date.getDay() + 7) % 7 || 7;
        date.setDate(date.getDate() + daysUntilTuesday);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        const dateStr = `${year}${month}${day}`;
        return `${dateStr}T080000Z/${dateStr}T180000Z`;
    }

    /**
     * Simulates fetching polling location data mimicking Google Civic Information API
     */
    async function fetchPollingLocation(zipCode) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (zipCode === '12345') {
                    resolve({
                        pollingLocations: [
                            {
                                address: {
                                    locationName: "Central Community Center",
                                    line1: "100 Main Street",
                                    city: "Springfield, SP 12345"
                                },
                                pollingHours: "07:00 AM - 08:00 PM"
                            }
                        ]
                    });
                } else {
                    resolve({
                        pollingLocations: []
                    });
                }
            }, 1200); // Simulate network delay
        });
    }
});
