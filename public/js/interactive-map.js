// In: public/js/interactive-map.js

const namibiaTowns = [
    { name: 'Windhoek', lat: -22.5594, lng: 17.0832 },
    { name: 'Swakopmund', lat: -22.678, lng: 14.532 },
    { name: 'Walvis Bay', lat: -22.957, lng: 14.505 },
    { name: 'Oshakati', lat: -17.783, lng: 15.683 },
    { name: 'Rundu', lat: -17.917, lng: 19.767 },
    { name: 'Keetmanshoop', lat: -26.583, lng: 18.133 },
    { name: 'Tsumeb', lat: -19.25, lng: 17.7167 },
    { name: 'Lüderitz', lat: -26.647, lng: 15.159 },
    { name: 'Gobabis', lat: -22.45, lng: 18.9667 },
    { name: 'Katima Mulilo', lat: -17.503, lng: 24.272 }
];

async function initializeInteractiveMap(containerId) {
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer || mapContainer.dataset.initialized === 'true') return;

    const map = L.map(containerId, { zoomControl: true, scrollWheelZoom: true, doubleClickZoom: true, touchZoom: true, dragging: true });
    const namibiaBounds = [[-28.97, 12.18], [-16.97, 25.26]];
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    
    if (containerId === 'leaflet-map') {
        namibiaTowns.forEach(town => {
            const marker = L.marker([town.lat, town.lng]).addTo(map);
            const popupEl = document.createElement('div');
            popupEl.className = 'map-popup-container';
            
            marker.bindPopup(popupEl, { minWidth: 200 });

            marker.on('popupopen', async () => {
                const townId = town.name.replace(/\s+/g, '');
                popupEl.innerHTML = `
                    <h4>${town.name}</h4>
                    <div class="qr-code-section">
                        <div class="qr-code-container-popup" id="qr-for-${townId}">
                            <p>Connecting to server...</p>
                        </div>
                        <p style="font-size: 0.8rem; margin-top: 5px;">Scan to open this town's page on this device.</p>
                    </div>`;
                
                const qrContainer = document.getElementById(`qr-for-${townId}`);
                if (!window.wsClientId) {
                    qrContainer.innerHTML = `<p style="color: red; font-size: 0.8rem;">Could not connect to real-time server. Please refresh.</p>`;
                    return;
                }

                qrContainer.innerHTML = `<p>Generating secure QR Code...</p>`;
                try {
                    const response = await generateTownScanQrCode(town.name, window.wsClientId);
                    if (response.errors) throw new Error(response.errors[0].message);
                    const qrCode = response.data.generateTownScanQrCode;
                    qrContainer.innerHTML = `<img src="${qrCode.dataUrl}" alt="QR Code for ${town.name}" style="width:180px; height:180px; margin:auto;">`;
                } catch (error) {
                    qrContainer.innerHTML = `<p style="color: red; font-size: 0.8rem;">Error: ${error.message}</p>`;
                }
            });
        });
        
    } else {
        try {
            const response = await getAllLocations();
            if (response.errors) throw new Error(response.errors[0].message);
            const locations = response.data.getAllLocations;

            locations.forEach(location => {
                const marker = L.marker([location.coordinates.lat, location.coordinates.lng]).addTo(map);
                const popupEl = document.createElement('div');
                popupEl.className = 'map-popup-container';
                marker.bindPopup(popupEl);
                marker.on('popupopen', async () => {
                    popupEl.innerHTML = `
                        <h4>${location.name}</h4>
                        <p>${location.description}</p>
                        <div class="comments-section">
                            <h5>Historical Facts & Comments</h5>
                            <div class="comments-list" id="comments-for-${location.id}"><p>Loading facts...</p></div>
                            <form class="comment-form" data-location-id="${location.id}">
                                <textarea name="comment" placeholder="Add a verified Namibian historical fact..." required></textarea>
                                <button type="submit">Submit</button>
                                <small class="form-status"></small>
                            </form>
                        </div>`;
                    await renderComments(location.id);
                    attachFormListener(popupEl.querySelector('.comment-form'));
                });
            });

        } catch (error) {
            console.error("Failed to load map locations:", error);
            mapContainer.innerHTML = `<p style="text-align: center; padding: 20px;">Could not load map locations.</p>`;
        }
    }

    async function renderComments(locationId) {
        const commentsList = document.getElementById(`comments-for-${locationId}`);
        try {
            const response = await getCommentsForLocation(locationId);
            if (response.errors) throw new Error(response.errors[0].message);
            const comments = response.data.getComments;
            commentsList.innerHTML = comments.length > 0 ? comments.map(comment => `
                <div class="comment-item">
                    <p class="comment-text">${comment.text}</p>
                    <span class="comment-author">- ${comment.author.username}</span>
                </div>`).join('') : '<p>No facts have been added for this location yet.</p>';
        } catch (error) {
            commentsList.innerHTML = '<p>Could not load facts.</p>';
        }
    }

    function attachFormListener(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const locationId = form.dataset.locationId;
            const text = form.querySelector('textarea').value;
            const statusEl = form.querySelector('.form-status');

            statusEl.textContent = 'Verifying fact with AI...';
            try {
                const response = await addComment(locationId, text);
                if (response.errors) throw new Error(response.errors[0].message);
                
                statusEl.textContent = 'Fact verified and added!';
                statusEl.style.color = 'green';
                form.querySelector('textarea').value = '';
                await renderComments(locationId);
            } catch (error) {
                statusEl.textContent = `Error: ${error.message}`;
                statusEl.style.color = 'red';
            }
        });
    }

    L.control.scale({ imperial: false }).addTo(map);
    mapContainer.dataset.initialized = 'true';

    setTimeout(() => {
        map.invalidateSize();
        map.fitBounds(namibiaBounds, { padding: [20, 20] });
    }, 100);
}