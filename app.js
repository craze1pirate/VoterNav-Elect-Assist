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

    // Step 3: Find Booth Button (Empty function as requested)
    const btnFindBooth = document.getElementById('btn-find-booth');
    if (btnFindBooth) {
        btnFindBooth.addEventListener('click', () => {
            // Function left empty for future implementation
            console.log('Find booth clicked');
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
});
