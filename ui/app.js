// Configured base paths for Nginx proxy routing.
const BASE_URLS = {
    logs: '/logs',
    users: '/users',
    costs: '/costs',
    about: '/about'
};

// DOM hook to render the JSON logs.
const output = document.getElementById('responseOutput');

/**
 * Renders JSON responses in the terminal simulation container.
 * @function displayResponse
 * @param {Object} responseData - The data object to display.
 * @param {boolean} [isError=false] - Flag indicating error state.
 */
const displayResponse = (responseData, isError = false) => {
    // Stringify JSON with standard indentation format.
    const outputString = JSON.stringify(responseData, null, 2);
    // Assign formatted text output to terminal area.
    output.textContent = outputString;
    
    // Toggle class names to style success and error colors.
    if (isError) {
        // Set text class to red.
        output.className = 'console-error';
    } else {
        // Set text class to green.
        output.className = 'console-success';
    }
};

/**
 * Formats caught JavaScript execution errors to screen.
 * @function displayError
 * @param {Error} requestError - The caught error object.
 */
const displayError = (requestError) => {
    // Output error message to screen logs.
    output.textContent = `Execution Error: ${requestError.message}`;
    // Assign error styling classes.
    output.className = 'console-error';
};

/**
 * Handles core fetch requests and logs state changes.
 * @async
 * @function makeRequest
 * @param {string} requestUrl - Target HTTP destination endpoint.
 * @param {Object} [fetchOptions={}] - Optional request options configuration.
 */
async function makeRequest(requestUrl, fetchOptions = {}) {
    try {
        // Render loading state before triggering call.
        output.textContent = 'Executing request...\nLoading data stream...';
        // Assign purple console indicator.
        output.className = 'console-info';
        
        // Execute request.
        const fetchResult = await fetch(requestUrl, fetchOptions);
        // Try parsing JSON payload.
        const resultJson = await fetchResult.json();
        
        // Check if response code indicates failure.
        if (!fetchResult.ok) {
            // Log response details with error flag enabled.
            displayResponse(resultJson, true);
        } else {
            // Log response details.
            displayResponse(resultJson, false);
        }
    } catch (executionError) {
        // Report exceptions to display area.
        displayError(executionError);
    }
}

// Add user registration form submit listener.
document.getElementById('addUserForm').addEventListener('submit', (event) => {
    // Block standard page refresh behavior.
    event.preventDefault();
    
    // Build user payload object.
    const userData = {
        id: document.getElementById('userId').value,
        firstName: document.getElementById('userFirstName').value,
        lastName: document.getElementById('userLastName').value,
        birthday: document.getElementById('userBirthday').value
    };
    
    // Dispatch request to users endpoint.
    makeRequest(`${BASE_URLS.users}/api/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
});

// Single user profile query form submit listener.
document.getElementById('getUserForm').addEventListener('submit', (event) => {
    // Block standard page refresh behavior.
    event.preventDefault();
    
    // Fetch entered user search identifier.
    const searchId = document.getElementById('getUserId').value;
    // Dispatch search query to API.
    makeRequest(`${BASE_URLS.users}/api/users/${searchId}`);
});

// Bulk user retrieval button action listener.
document.getElementById('listUsersBtn').addEventListener('click', () => {
    // Request registered user list.
    makeRequest(`${BASE_URLS.users}/api/users`);
});

// Cost entry creation form submit listener.
document.getElementById('addCostForm').addEventListener('submit', (event) => {
    // Block standard page refresh behavior.
    event.preventDefault();
    
    // Compile cost data properties.
    const costRecord = {
        userId: document.getElementById('costUserId').value,
        description: document.getElementById('costDesc').value,
        category: document.getElementById('costCategory').value,
        sum: document.getElementById('costSum').value
    };
    
    // Post new purchase object details.
    makeRequest(`${BASE_URLS.costs}/api/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(costRecord)
    });
});

// Monthly expense report generation form submit listener.
document.getElementById('getReportForm').addEventListener('submit', (event) => {
    // Block standard page refresh behavior.
    event.preventDefault();
    
    // Fetch query details.
    const reportUserId = document.getElementById('reportUserId').value;
    const reportYear = document.getElementById('reportYear').value;
    const reportMonth = document.getElementById('reportMonth').value;
    
    // Build query argument line.
    const reportQuery = `id=${reportUserId}&year=${reportYear}&month=${reportMonth}`;
    // Dispatch search query arguments to API.
    makeRequest(`${BASE_URLS.costs}/api/report?${reportQuery}`);
});

// Purchase lists query trigger.
document.getElementById('listCostsBtn').addEventListener('click', () => {
    // Pull full history of payments.
    makeRequest(`${BASE_URLS.costs}/api/costs`);
});

// Cache report records request trigger.
document.getElementById('listReportsBtn').addEventListener('click', () => {
    // Fetch all pre-computed cached reports.
    makeRequest(`${BASE_URLS.costs}/api/reports`);
});

// Global logs monitoring trigger.
document.getElementById('getLogsBtn').addEventListener('click', () => {
    // Fetch all logger database entries.
    makeRequest(`${BASE_URLS.logs}/api/logs`);
});

// General team identity query trigger.
document.getElementById('getAboutBtn').addEventListener('click', () => {
    // Call administrative about details.
    makeRequest(`${BASE_URLS.about}/api/about`);
});

// Console reset action button listener.
document.getElementById('clearConsoleBtn').addEventListener('click', () => {
    // Set terminal output text back to default instruction message.
    output.textContent = 'System log cleared. Awaiting API instruction...';
    // Clear custom color formatting style class.
    output.className = '';
});
