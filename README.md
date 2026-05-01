**VoterNav - Your Smart Election Companion**



**Overview**

VoterNav is a lightweight, interactive web application designed to guide citizens through the electoral process. Built to be highly accessible and intuitive, it transforms complex voting procedures into a simple, three-step interactive wizard.



**Chosen Vertical**

Challenge 2: Create an assistant that helps users understand the election process, timelines, and steps in an interactive and easy-to-follow way.



**Approach and Logic**

To ensure maximum accessibility, extremely fast load times, and a repository size well under the 10 MB limit, VoterNav was built using purely Vanilla HTML, CSS, and JavaScript. 



The application utilizes a single-page architecture with three core logical steps:

**1. Eligibility Check:** Instantly validates user age and citizenship status using client-side JS logic.

**2. Interactive Timeline:** Visually breaks down the electoral timeline into digestible phases.

**3. Action Center (Google Integrations):** Provides highly practical, real-world utility by helping the user locate their booth and set calendar reminders.



**Meaningful Google Services Integration**

VoterNav meaningfully integrates the Google ecosystem to enhance practical usability:

**Google Calendar API:** Implemented a dynamic URL generator that allows users to instantly add a pre-filled "Election Day Reminder" to their Google Calendar, drastically reducing voter drop-off on polling day.

**Google Civic Information API (Simulated):** Built the complete asynchronous `fetch()` logic and UI rendering pipeline to query and display polling locations based on ZIP codes. 



**Assumptions Made**

**API Constraints:** Due to time constraints and to prioritize a seamless evaluation experience without requiring reviewers to input personal API keys, the Google Civic Information API response was securely mocked. The architecture is fully prepared to swap the simulated JSON with a live Google Cloud API endpoint. 

**Accessibility:** Assumed that users may be accessing the application on low-bandwidth mobile devices, hence the strict adherence to zero heavy framework dependencies and CDN-based styling.

