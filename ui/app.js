const BASE_URLS = {
    logs: '/logs',
    users: '/users',
    costs: '/costs',
    about: '/about'
};

const output = document.getElementById('responseOutput');

/**
 * Displays the JSON response from the server in the output area.
 * @function displayResponse
 * @param {Object} responseData - The data object to display.
 */
const displayResponse = (responseData) => {
    output.textContent = JSON.stringify(responseData, null, 2);
};

/**
 * Displays an error message in the output area.
 * @function displayError
 * @param {Error} requestError - The error object to display.
 */
const displayError = (requestError) => {
    output.textContent = `Error: ${requestError.message}`;
};

/**
 * Helper function to perform fetch requests to the backend services.
 * Handles loading state and error reporting.
 * @async
 * @function makeRequest
 * @param {string} requestUrl - The full URL for the request.
 * @param {Object} [fetchOptions={}] - Optional fetch configuration.
 */
async function makeRequest(requestUrl, fetchOptions = {}) {
    try {
        output.textContent = 'Loading...';
        
        const fetchResult = await fetch(requestUrl, fetchOptions);
        const resultJson = await fetchResult.json();
        
        displayResponse(resultJson);
    } catch (executionError) {
        displayError(executionError);
    }
}

// --- Users Service Event Handlers ---

document.getElementById('addUserForm').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const userData = {
        id: Number(document.getElementById('userId').value),
        firstName: document.getElementById('userFirstName').value,
        lastName: document.getElementById('userLastName').value,
        birthday: document.getElementById('userBirthday').value
    };
    
    makeRequest(`${BASE_URLS.users}/api/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
});

document.getElementById('getUserForm').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const searchId = document.getElementById('getUserId').value;
    makeRequest(`${BASE_URLS.users}/api/users/${searchId}`);
});

document.getElementById('listUsersBtn').addEventListener('click', () => {
    makeRequest(`${BASE_URLS.users}/api/users`);
});

// --- Costs Service Event Handlers ---

document.getElementById('addCostForm').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const costRecord = {
        userId: Number(document.getElementById('costUserId').value),
        description: document.getElementById('costDesc').value,
        category: document.getElementById('costCategory').value,
        sum: Number(document.getElementById('costSum').value)
    };
    
    makeRequest(`${BASE_URLS.costs}/api/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(costRecord)
    });
});

document.getElementById('getReportForm').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const reportUserId = document.getElementById('reportUserId').value;
    const reportYear = document.getElementById('reportYear').value;
    const reportMonth = document.getElementById('reportMonth').value;
    
    const reportQuery = `id=${reportUserId}&year=${reportYear}&month=${reportMonth}`;
    makeRequest(`${BASE_URLS.costs}/api/report?${reportQuery}`);
});

document.getElementById('listCostsBtn').addEventListener('click', () => {
    makeRequest(`${BASE_URLS.costs}/api/costs`);
});

document.getElementById('listReportsBtn').addEventListener('click', () => {
    makeRequest(`${BASE_URLS.costs}/api/reports`);
});

// --- Logs & About Service Event Handlers ---

document.getElementById('getLogsBtn').addEventListener('click', () => {
    makeRequest(`${BASE_URLS.logs}/api/logs`);
});

document.getElementById('getAboutBtn').addEventListener('click', () => {
    makeRequest(`${BASE_URLS.about}/api/about`);
});
