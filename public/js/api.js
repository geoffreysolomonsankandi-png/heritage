// In: public/js/api.js

const GRAPHQL_ENDPOINT = '/graphql';

async function fetchGraphQL(query, variables = {}) {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ query, variables })
        });
        return response.json();
    } catch (error) {
        console.error("Network or GraphQL fetch error:", error);
        return { errors: [{ message: "Network error." }] };
    }
}

function getAllLocations() {
    const query = `query { getAllLocations { id, name, description, coordinates { lat, lng } } }`;
    return fetchGraphQL(query);
}

function loginUser(email, password) {
    const mutation = `mutation($email: String!, $password: String!) { login(email: $email, password: $password) { token, user { id, username, role } } }`;
    return fetchGraphQL(mutation, { email, password });
}

function getCommentsForLocation(locationId) {
    const query = `query($locationId: ID!) { getComments(locationId: $locationId) { id, text, author { username }, createdAt } }`;
    return fetchGraphQL(query, { locationId });
}

function addComment(locationId, text) {
    const mutation = `mutation($locationId: ID!, $text: String!) { addComment(locationId: $locationId, text: $text) { id } }`;
    return fetchGraphQL(mutation, { locationId, text });
}

function getQrCodeForLocation(locationId) {
    const query = `query($locationId: ID!) { getQrCodeForLocation(locationId: $locationId) { id, dataUrl } }`;
    return fetchGraphQL(query, { locationId });
}

// --- NEW API FUNCTION ---
function generateTownScanQrCode(townName, clientId) {
    const mutation = `
        mutation($townName: String!, $clientId: String!) {
            generateTownScanQrCode(townName: $townName, clientId: $clientId) {
                id
                dataUrl
            }
        }
    `;
    return fetchGraphQL(mutation, { townName, clientId });
}

function uploadImage(key, description, file) {
    const query = `mutation($key: String!, $description: String, $file: Upload!) { uploadSiteImage(key: $key, description: $description, file: $file) { id, key, imageUrl } }`;
    const formData = new FormData();
    formData.append('operations', JSON.stringify({ query, variables: { key, description, file: null } }));
    formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
    formData.append('0', file);
    return fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        body: formData,
    }).then(res => res.json());
}

function deleteImage(key) {
    const mutation = `mutation($key: String!) { deleteSiteImage(key: $key) { id, key } }`;
    return fetchGraphQL(mutation, { key });
}

function updateText(key, content, page, description) {
    const mutation = `mutation($key: String!, $content: String!, $page: String, $description: String) { updateTextContent(key: $key, content: $content, page: $page, description: $description) { id, key, content } }`;
    return fetchGraphQL(mutation, { key, content, page, description });
}

function uploadEventImage(file) {
    const formData = new FormData();
    formData.append('eventImage', file);
    return fetch('/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        body: formData
    }).then(res => {
        if (!res.ok) return res.json().then(errorBody => { throw new Error(errorBody.error || 'Image upload failed.') });
        return res.json();
    });
}

function getHistoricalEvents() {
    const query = `query { getHistoricalEvents { id, month, day, title, description, imageUrl, link, isFeatured } }`;
    return fetchGraphQL(query);
}

function addHistoricalEvent(variables) {
    const mutation = `mutation($month: Int!, $day: Int!, $title: String!, $description: String!, $imageUrl: String!, $link: String) { addHistoricalEvent(month: $month, day: $day, title: $title, description: $description, imageUrl: $imageUrl, link: $link) { id } }`;
    return fetchGraphQL(mutation, variables);
}

function updateHistoricalEvent(id, variables) {
    const mutation = `mutation($id: ID!, $month: Int, $day: Int, $title: String, $description: String, $imageUrl: String, $link: String) { updateHistoricalEvent(id: $id, month: $month, day: $day, title: $title, description: $description, imageUrl: $imageUrl, link: $link) { id } }`;
    return fetchGraphQL(mutation, { id, ...variables });
}

function deleteHistoricalEvent(id) {
    const mutation = `mutation($id: ID!) { deleteHistoricalEvent(id: $id) { id } }`;
    return fetchGraphQL(mutation, { id });
}

function setFeaturedEvent(id) {
    const mutation = `mutation($id: ID!) { setFeaturedEvent(id: $id) { id, isFeatured } }`;
    return fetchGraphQL(mutation, { id });
}

function unsetFeaturedEvent() {
    const mutation = `mutation { unsetFeaturedEvent { id, isFeatured } }`;
    return fetchGraphQL(mutation);
}