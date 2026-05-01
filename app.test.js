// app.test.js
// Since VoterNav is a vanilla JS application with logic tied to the DOM, 
// we extract the pure core logic here to unit test it with Jest.

// --- Core Logic Functions ---

function checkEligibility(age, isCitizen) {
    if (age >= 18 && isCitizen) {
        return { eligible: true };
    }
    
    let reasons = [];
    if (age < 18) reasons.push('you must be 18 years or older');
    if (!isCitizen) reasons.push('you must be a citizen');
    
    return { eligible: false, reasons: reasons };
}

function calculateNextTuesday() {
    const date = new Date();
    const daysUntilTuesday = (2 - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilTuesday);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const dateStr = `${year}${month}${day}`;
    return `${dateStr}T080000Z/${dateStr}T180000Z`;
}

function generateGoogleCalendarLink(title, details, dates) {
    const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const encodedTitle = encodeURIComponent(title);
    const encodedDetails = encodeURIComponent(details);
    const encodedDates = encodeURIComponent(dates);
    
    return `${baseUrl}&text=${encodedTitle}&details=${encodedDetails}&dates=${encodedDates}`;
}

// --- Jest Unit Tests ---

describe('VoterNav Assistant Core Logic', () => {

    // Test 1: Testing the calculateNextTuesday function format
    test('calculateNextTuesday should return correct Google Calendar date format', () => {
        const result = calculateNextTuesday();
        // Matches YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ format
        const regex = /^\d{8}T080000Z\/\d{8}T180000Z$/;
        expect(result).toMatch(regex);
    });

    // Test 2: Testing eligibility logic (Eligible)
    test('checkEligibility should return true when Age is >= 18 and Citizenship is true', () => {
        const result = checkEligibility(25, true);
        expect(result.eligible).toBe(true);
    });

    // Test 3: Testing eligibility logic (Underage)
    test('checkEligibility should return false and specify age reason when Age is < 18', () => {
        const result = checkEligibility(16, true);
        expect(result.eligible).toBe(false);
        expect(result.reasons).toContain('you must be 18 years or older');
    });

    // Test 4: Testing eligibility logic (Not a citizen)
    test('checkEligibility should return false and specify citizenship reason when not a citizen', () => {
        const result = checkEligibility(30, false);
        expect(result.eligible).toBe(false);
        expect(result.reasons).toContain('you must be a citizen');
    });

    // Test 5: Testing the Google Calendar URL Generation
    test('generateGoogleCalendarLink should start with correct base URL and encode parameters', () => {
        const title = 'Election Day';
        const details = 'Time to vote!';
        const dates = '20261103T080000Z/20261103T180000Z';
        
        const link = generateGoogleCalendarLink(title, details, dates);
        
        expect(link.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE')).toBe(true);
        expect(link).toContain(`text=${encodeURIComponent(title)}`);
        expect(link).toContain(`details=${encodeURIComponent(details)}`);
    });
});
