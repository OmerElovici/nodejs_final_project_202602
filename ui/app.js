const BASE_URLS = {
    logs: 'http://localhost:3001',
    users: 'http://localhost:3002',
    costs: 'http://localhost:3003',
    about: 'http://localhost:3004'
};

const output = document.getElementById('responseOutput');

function displayResponse(data) {
    output.textContent = JSON.stringify(data, null, 2);
}

function displayError(err) {
    output.textContent = `Error: ${err.message}`;
}

async function makeRequest(url, options = {}) {
    try {
        output.textContent = 'Loading...';
        const response = await fetch(url, options);
        const data = await response.json();
        displayResponse(data);
    } catch (error) {
        displayError(error);
    }
}

// Users Service
document.getElementById('addUserForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
        id: Number(document.getElementById('userId').value),
        first_name: document.getElementById('userFirstName').value,
        last_name: document.getElementById('userLastName').value,
        birthday: document.getElementById('userBirthday').value
    };
    makeRequest(`${BASE_URLS.users}/api/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
});

document.getElementById('getUserForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('getUserId').value;
    makeRequest(`${BASE_URLS.users}/api/users/${id}`);
});

document.getElementById('listUsersBtn').addEventListener('click', () => {
    makeRequest(`${BASE_URLS.users}/api/users`);
});

// Costs Service
document.getElementById('addCostForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
        userid: Number(document.getElementById('costUserId').value),
        description: document.getElementById('costDesc').value,
        category: document.getElementById('costCategory').value,
        sum: Number(document.getElementById('costSum').value)
    };
    makeRequest(`${BASE_URLS.costs}/api/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
});

document.getElementById('getReportForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('reportUserId').value;
    const year = document.getElementById('reportYear').value;
    const month = document.getElementById('reportMonth').value;
    makeRequest(`${BASE_URLS.costs}/api/report?id=${id}&year=${year}&month=${month}`);
});

// Logs Service
document.getElementById('getLogsBtn').addEventListener('click', () => {
    makeRequest(`${BASE_URLS.logs}/api/logs`);
});

// About Service
document.getElementById('getAboutBtn').addEventListener('click', () => {
    makeRequest(`${BASE_URLS.about}/api/about`);
});
