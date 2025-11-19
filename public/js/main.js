// In: public/js/main.js

document.addEventListener('DOMContentLoaded', function () {
    // --- NEW: WEBSOCKET CLIENT SETUP ---
    function connectWebSocket() {
        // Use wss:// for secure connections (in production)
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const ws = new WebSocket(`${protocol}://${window.location.host}`);

        ws.onopen = () => console.log('WebSocket connection established.');
        ws.onclose = () => {
            console.log('WebSocket connection closed. Reconnecting in 3 seconds...');
            setTimeout(connectWebSocket, 3000); // Attempt to reconnect
        };
        ws.onerror = (error) => console.error('WebSocket Error:', error);

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            switch (message.type) {
                case 'init':
                    // Store the unique client ID provided by the server
                    window.wsClientId = message.clientId;
                    console.log(`Connected with client ID: ${window.wsClientId}`);
                    break;
                case 'navigate':
                    // Received a command from the server to navigate
                    console.log(`Received navigation command:`, message.url);
                    window.location.href = message.url;
                    break;
            }
        };
    }
    // --- END OF WEBSOCKET SETUP ---

    // --- DOM ELEMENT SETUP ---
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;
    const header = document.querySelector('.header');

    // --- ADMIN DASHBOARD DATA (CONFIG) ---
    // ... (rest of the file is unchanged)
    const editableContent = {
        home: {
            texts: [
                { key: 'homeHeroTitle', description: 'Hero Title', type: 'input' },
                { key: 'homeHeroSubtitle', description: 'Hero Subtitle', type: 'textarea' },
                { key: 'homeHeroButton', description: 'Hero Button Text', type: 'input' },
                { key: 'homeGalleryTitle', description: 'Gallery Title', type: 'input' },
                { key: 'homeMemorialTitle', description: 'Memorial Section Title', type: 'input' },
                { key: 'homeMapTitle', description: 'Map Section Title', type: 'input' },
                { key: 'homeTestimonialTitle', description: 'Testimonial Title', type: 'input' },
            ],
            images: [
                { key: 'heroBackground', description: 'Main hero background' },
                { key: 'homeGallery1', description: 'Gallery Preview Image 1' },
                { key: 'homeGallery2', description: 'Gallery Preview Image 2' },
                { key: 'homeGallery3', description: 'Gallery Preview Image 3' },
                { key: 'homeMap', description: 'Interactive Map Preview' },
            ]
        },
        about: {
            texts: [
                { key: 'aboutMissionTitle', description: 'Mission Section Title', type: 'input' },
                { key: 'aboutMissionParagraph', description: 'Mission Paragraph', type: 'textarea' },
                { key: 'aboutTestimonialTitle', description: 'Testimonial Section Title', type: 'input' },
                { key: 'aboutTestimonialQuote1', description: 'Testimonial 1: Quote', type: 'textarea' },
                { key: 'aboutTestimonialAuthor1', description: 'Testimonial 1: Author Name', type: 'input' },
                { key: 'aboutTestimonialQuote2', description: 'Testimonial 2: Quote', type: 'textarea' },
                { key: 'aboutTestimonialAuthor2', description: 'Testimonial 2: Author Name', type: 'input' },
                { key: 'aboutTestimonialQuote3', description: 'Testimonial 3: Quote', type: 'textarea' },
                { key: 'aboutTestimonialAuthor3', description: 'Testimonial 3: Author Name', type: 'input' },
            ],
            images: [
                { key: 'testimonialAvatar1', description: 'Testimonial Avatar 1' },
                { key: 'testimonialAvatar2', description: 'Testimonial Avatar 2' },
                { key: 'testimonialAvatar3', description: 'Testimonial Avatar 3' },
            ]
        },
        calendar: {
            isList: true,
            title: "Events Calendar",
            description: "Manage all entries in the historical events calendar. Click 'Edit' to see a live preview on the right.",
            itemFields: [
                { name: 'month', placeholder: 'Month (1-12)', type: 'number', required: true },
                { name: 'day', placeholder: 'Day (1-31)', type: 'number', required: true },
                { name: 'title', placeholder: 'Event Title', type: 'text', required: true },
                { name: 'description', placeholder: 'Event Description', type: 'textarea', required: true },
                { name: 'imageUrl', placeholder: 'Event Image', type: 'file', required: true },
                { name: 'link', placeholder: '"Read More" Link (Optional)', type: 'text', required: false },
            ]
        }
    };
    
    // --- SUBMISSION FORM LOGIC ---
    function initializeSubmissionForm() {
        const submissionForm = document.getElementById('submission-form');
        const resultContainer = document.getElementById('submission-result');
        if (!submissionForm || submissionForm.dataset.initialized === 'true') return;

        submissionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            resultContainer.innerHTML = '<p>Submitting...</p>';

            const variables = {
                name: document.getElementById('name').value,
                description: document.getElementById('description').value,
                imageUrl: document.getElementById('imageUrl').value,
                lat: parseFloat(document.getElementById('lat').value),
                lng: parseFloat(document.getElementById('lng').value)
            };

            try {
                const response = await submitLocation(variables);
                if (response.errors) throw new Error(response.errors[0].message);

                const { location, suggestions } = response.data.submitLocation;
                let successHTML = `<h4 class="success-message">Thank you! Your submission for "${location.name}" has been received.</h4>`;
                if (suggestions && suggestions.length > 0) {
                    successHTML += `<h5>AI-Powered Similar Searches</h5><p>Based on your submission, you might also be interested in:</p><ul class="suggestions-list">${suggestions.map(s => `<li>${s}</li>`).join('')}</ul>`;
                }
                resultContainer.innerHTML = successHTML;
                submissionForm.reset();

            } catch (error) {
                resultContainer.innerHTML = `<p class="error-message">Submission Failed: ${error.message}</p>`;
            }
        });
        submissionForm.dataset.initialized = 'true';
    }

    // --- LOGIN FORM INITIALIZATION ---
    function initializeLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm || loginForm.dataset.initialized === 'true') return;
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                const response = await loginUser(email, password);
                if (response.errors) throw new Error(response.errors[0].message);
                const { token, user } = response.data.login;
                localStorage.setItem('authToken', token);
                alert('Login successful!');
                const targetPage = user.role === 'admin' ? 'admin' : 'dashboard';
                window.location.hash = `#${targetPage}`;
                showPage(targetPage);
            } catch (error) {
                alert(`Login failed: ${error.message}`);
            }
        });
        loginForm.dataset.initialized = 'true';
    }

    // --- ADMIN DASHBOARD INITIALIZATION & LOGIC ---
    function initializeAdminDashboard() {
        const adminContainer = document.getElementById('admin');
        if (!adminContainer || adminContainer.dataset.initialized === 'true') return;

        const adminNav = adminContainer.querySelector('.admin-nav');
        const previewFrame = adminContainer.querySelector('#admin-preview-frame');
        const controlsContainer = adminContainer.querySelector('#admin-controls-content');
        const controlsTitle = adminContainer.querySelector('#admin-controls-title');

        function updateEventPreview(eventData) {
            const previewDoc = previewFrame.contentWindow.document;
            if (!previewDoc) return;
            const container = previewDoc.getElementById('motd-container');
            if (!container) return;
            if (!eventData) {
                container.innerHTML = `<div style="text-align: center; padding: 2rem;"><p>Select an event to preview or edit.</p></div>`;
                return;
            }
            container.innerHTML = `<div class="feature"><div class="feature-text"><h3 data-editable-key="motd_title">${eventData.title || ''}</h3><p data-editable-key="motd_desc">${eventData.description || ''}</p>${eventData.link ? `<a href="${eventData.link}" class="btn btn-primary" target="_blank">Read More</a>` : ''}</div><div class="feature-image"><img src="${eventData.imageUrl || ''}" alt="${eventData.title || ''}" data-editable-key="motd_image"></div></div>`;
        }
        
        async function fetchAndDisplayEvents() {
            const listContainer = document.getElementById('existing-events-list');
            if (!listContainer) return;
            listContainer.innerHTML = '<p>Loading events...</p>';
            try {
                const response = await getHistoricalEvents();
                if (response.data && response.data.getHistoricalEvents) {
                    const events = response.data.getHistoricalEvents;
                    window.historicalEventsData = events;
                    if (events.length > 0) {
                        listContainer.innerHTML = events.map(event => {
                            const featuredButton = event.isFeatured ? `<button class="btn btn-secondary btn-unset-featured">Unset Featured</button>` : `<button class="btn btn-secondary btn-set-featured">Set as Featured</button>`;
                            return `<div class="admin-item ${event.isFeatured ? 'featured-item' : ''}" data-id="${event.id}"><div class="item-details"><h4>${event.month}/${event.day}: ${event.title} ${event.isFeatured ? '<span class="featured-badge">Featured</span>' : ''}</h4></div><div class="item-actions">${featuredButton}<button class="btn btn-secondary btn-edit-event">Edit</button><button class="btn btn-reject btn-delete-event">Delete</button></div></div>`;
                        }).join('');
                    } else {
                        listContainer.innerHTML = '<p>No events found.</p>';
                    }
                }
            } catch (error) {
                listContainer.innerHTML = '<p>Error loading events.</p>';
            }
        }

        function generateAdminControls(pageKey) {
            const contentConfig = editableContent[pageKey];
            if (!controlsContainer || !contentConfig) { controlsContainer.innerHTML = '<p>No editable content defined.</p>'; return; }
            if (contentConfig.isList) {
                let html = `<p>${contentConfig.description}</p>`;
                html += '<form class="admin-item" id="add-item-form" enctype="multipart/form-data"><h4>Add New Item</h4>';
                contentConfig.itemFields.forEach(field => {
                    let input;
                    if (field.type === 'textarea') {
                        input = `<textarea id="new-item-${field.name}" placeholder="${field.placeholder}" class="text-input" style="margin-bottom: 0.5rem;"></textarea>`;
                    } else if (field.type === 'file') {
                        input = `<label style="margin-top: 0.5rem; font-weight: normal;">${field.placeholder}</label><input type="file" id="new-item-${field.name}" class="text-input" style="margin-bottom: 0.5rem;" accept="image/*"><img id="event-image-preview" src="" alt="Image Preview" style="max-width: 100%; height: auto; margin-top: 10px; border-radius: 6px; display: none;">`;
                    } else {
                        input = `<input type="${field.type}" id="new-item-${field.name}" placeholder="${field.placeholder}" class="text-input" style="margin-bottom: 0.5rem;">`;
                    }
                    html += input;
                });
                html += '<button id="add-item-btn" class="btn btn-primary" style="margin-top: 0.5rem;">Add Item</button></form>';
                html += `<h4 class="admin-subtitle">Existing Items</h4><div id="existing-events-list"></div>`;
                controlsContainer.innerHTML = html;
                const fileInput = document.getElementById('new-item-imageUrl');
                const preview = document.getElementById('event-image-preview');
                if (fileInput) { fileInput.addEventListener('change', () => { const file = fileInput.files[0]; if (file) { preview.src = URL.createObjectURL(file); preview.style.display = 'block'; } }); }
                fetchAndDisplayEvents();
            } else {
                const { texts, images } = contentConfig;
                let html = '';
                if (texts && texts.length > 0) { html += '<h4 class="admin-subtitle">Text Content</h4>' + texts.map(text => { const val = siteTexts[text.key] || ''; const input = text.type === 'textarea' ? `<textarea class="text-input" data-key="${text.key}" rows="4">${val}</textarea>` : `<input type="text" class="text-input" value="${val}" data-key="${text.key}">`; return `<div class="admin-item text-item" data-key="${text.key}"><label>${text.description}</label>${input}<div class="item-actions"><button class="btn btn-primary btn-save-text">Save</button><span class="save-status"></span></div></div>`; }).join(''); }
                if (images && images.length > 0) { html += '<h4 class="admin-subtitle">Image Content</h4>' + images.map(img => `<div class="admin-item image-item" data-key="${img.key}"><div class="item-details"><h4>${img.description}</h4></div><div class="item-actions"><input type="file" class="image-upload-input" data-key="${img.key}" style="display: none;" accept="image/*"><button class="btn btn-primary btn-change">Upload</button><button class="btn btn-reject btn-delete-image">Delete</button></div></div>`).join(''); }
                controlsContainer.innerHTML = html;
            }
        }

        function switchToEditMode(eventId, form) {
            const event = window.historicalEventsData.find(e => e.id === eventId);
            if (!event) return;
            updateEventPreview(event);
            form.dataset.editId = eventId;
            form.dataset.currentImageUrl = event.imageUrl;
            form.querySelector('h4').textContent = 'Edit Event';
            editableContent.calendar.itemFields.forEach(field => {
                const input = document.getElementById(`new-item-${field.name}`);
                if (field.type !== 'file') { input.value = event[field.name] || ''; }
            });
            const preview = document.getElementById('event-image-preview');
            preview.src = event.imageUrl;
            preview.style.display = 'block';
            const submitBtn = document.getElementById('add-item-btn');
            submitBtn.textContent = 'Update Item';
            if (!document.getElementById('cancel-edit-btn')) {
                const cancelBtn = document.createElement('button');
                cancelBtn.id = 'cancel-edit-btn';
                cancelBtn.className = 'btn btn-secondary';
                cancelBtn.textContent = 'Cancel';
                cancelBtn.style.marginLeft = '0.5rem';
                submitBtn.parentNode.appendChild(cancelBtn);
            }
        }

        function switchToAddMode(form) {
            updateEventPreview(null);
            form.removeAttribute('data-edit-id');
            form.removeAttribute('data-current-image-url');
            form.querySelector('h4').textContent = `Add New ${editableContent.calendar.title} Item`;
            form.reset();
            document.getElementById('event-image-preview').style.display = 'none';
            const submitBtn = document.getElementById('add-item-btn');
            submitBtn.textContent = 'Add Item';
            const cancelBtn = document.getElementById('cancel-edit-btn');
            if (cancelBtn) cancelBtn.remove();
        }

        adminNav.addEventListener('click', (e) => {
            e.preventDefault();
            const navLink = e.target.closest('.admin-nav-link');
            if (navLink) {
                const targetPage = navLink.dataset.target;
                const currentActiveTab = localStorage.getItem('activeAdminTab') || 'home';
                if (targetPage !== currentActiveTab) {
                    localStorage.setItem('activeAdminTab', targetPage);
                    window.location.reload();
                }
            }
        });

        controlsContainer.addEventListener('click', async (e) => {
            const target = e.target;
            const item = target.closest('.admin-item');
            const pageKey = document.querySelector('.admin-nav-link.active').dataset.target;
            const contentConfig = editableContent[pageKey];
            const form = document.getElementById('add-item-form');

            if (target.id === 'add-item-btn') {
                e.preventDefault();
                const editId = form.dataset.editId;
                const variables = {};
                let isValid = true;
                const imageInput = document.getElementById('new-item-imageUrl');
                const imageFile = imageInput.files[0];
                let finalImageUrl = form.dataset.currentImageUrl || '';
                if (imageFile) {
                    try { const uploadResponse = await uploadEventImage(imageFile); finalImageUrl = uploadResponse.imageUrl; }
                    catch (error) { return alert(`Image upload failed: ${error.message}`); }
                }
                if (!finalImageUrl && !editId) { return alert('An image is required for new events.'); }
                variables['imageUrl'] = finalImageUrl;
                contentConfig.itemFields.forEach(field => {
                    if (field.type !== 'file') {
                        const input = document.getElementById(`new-item-${field.name}`);
                        let value = input.value;
                        if (field.type === 'number') value = parseInt(value, 10);
                        if (field.required && !value) isValid = false;
                        variables[field.name] = value;
                    }
                });
                if (!isValid) return alert('Please fill all required text fields.');
                try {
                    if (editId) { 
                        await updateHistoricalEvent(editId, variables); 
                        alert('Event updated!'); 
                    } else { 
                        await addHistoricalEvent(variables); 
                        alert('Event added!'); 
                    }
                    window.location.reload();
                } catch (error) { 
                    alert(`Error: ${error.message}`); 
                }
            }

            if (target.classList.contains('btn-edit-event')) { e.preventDefault(); switchToEditMode(item.dataset.id, form); }
            if (target.id === 'cancel-edit-btn') { e.preventDefault(); switchToAddMode(form); }
            if (target.classList.contains('btn-delete-event')) {
                const eventId = item.dataset.id;
                if (confirm('Are you sure?')) {
                    try { await deleteHistoricalEvent(eventId); alert('Event deleted.'); fetchAndDisplayEvents(); }
                    catch (error) { alert(`Error: ${error.message}`); }
                }
            }
            
            if (item && item.dataset.key) {
                const key = item.dataset.key;
                if (target.classList.contains('btn-save-text')) {
                    const input = item.querySelector('.text-input');
                    const status = item.querySelector('.save-status');
                    const content = input.value;
                    const meta = contentConfig?.texts.find(t => t.key === key);
                    status.textContent = 'Saving...';
                    try { await updateText(key, content, meta.page, meta.description); status.textContent = 'Saved!'; siteTexts[key] = content; setTimeout(() => status.textContent = '', 2000); }
                    catch (error) { status.textContent = 'Error!'; }
                }
                if (target.classList.contains('btn-change')) { item.querySelector('.image-upload-input').click(); }
                if (target.classList.contains('btn-delete-image')) {
                    if (confirm(`Are you sure?`)) {
                        try { await deleteImage(key); alert('Image deleted!'); window.location.reload(); }
                        catch (error) { alert(`Error deleting image: ${error.message}`); }
                    }
                }
            }
            if (target.classList.contains('btn-set-featured') || target.classList.contains('btn-unset-featured')) {
                e.preventDefault();
                const eventId = item.dataset.id;
                try {
                    if (target.classList.contains('btn-set-featured')) { await setFeaturedEvent(eventId); alert('Event set as featured.'); }
                    else { await unsetFeaturedEvent(); alert('Featured event unset.'); }
                    fetchAndDisplayEvents();
                } catch (error) { alert(`Error: ${error.message}`); }
            }
        });

        controlsContainer.addEventListener('input', (e) => {
            const form = e.target.closest('#add-item-form');
            if (form) {
                const editId = form.dataset.editId;
                const eventData = editId ? { ...window.historicalEventsData.find(ev => ev.id === editId) } : {};
                editableContent.calendar.itemFields.forEach(field => {
                    if (field.type !== 'file') { eventData[field.name] = document.getElementById(`new-item-${field.name}`).value; }
                });
                const imageInput = document.getElementById('new-item-imageUrl');
                if (imageInput && imageInput.files[0]) {
                    eventData.imageUrl = URL.createObjectURL(imageInput.files[0]);
                } else if (editId) {
                    eventData.imageUrl = form.dataset.currentImageUrl;
                } else {
                    eventData.imageUrl = document.getElementById('event-image-preview').src || '';
                }
                updateEventPreview(eventData);
            } else if (e.target.classList.contains('text-input')) {
                const key = e.target.dataset.key;
                const content = e.target.value;
                const previewElement = previewFrame.contentWindow.document.querySelector(`[data-editable-key="${key}"]`);
                if (previewElement) { previewElement.innerText = content; }
            }
        });
        
        controlsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('image-upload-input')) {
                const key = e.target.dataset.key;
                const file = e.target.files[0];
                if (!file) return;
                const previewUrl = URL.createObjectURL(file);
                const previewElement = previewFrame.contentWindow.document.querySelector(`[data-editable-key="${key}"]`);
                if (previewElement) {
                    if (previewElement.dataset.editableType === 'background') {
                        previewElement.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${previewUrl}')`;
                    } else {
                        previewElement.src = previewUrl;
                    }
                }
            }
        });
        
        const activeTab = localStorage.getItem('activeAdminTab') || 'home';
        const activeLink = adminNav.querySelector(`[data-target="${activeTab}"]`);
        if (activeLink) {
            adminNav.querySelectorAll('.admin-nav-link').forEach(link => link.classList.remove('active'));
            activeLink.classList.add('active');
        }

        if (activeTab === 'calendar') {
            previewFrame.style.display = 'flex';
            controlsContainer.style.width = '380px';
            previewFrame.src = `/?preview=true#home`;
            controlsTitle.textContent = `Managing: Events Calendar`;
            previewFrame.onload = () => {
                const doc = previewFrame.contentWindow.document;
                const motdSection = doc.getElementById('motd-section-preview');
                const body = doc.body;
                if (motdSection && body) {
                    body.innerHTML = motdSection.outerHTML;
                    body.style.display = 'flex';
                    body.style.alignItems = 'center';
                    body.style.justifyContent = 'center';
                    body.style.padding = '2rem';
                }
            };
        } else {
            previewFrame.style.display = 'flex';
            controlsContainer.style.width = '380px';
            previewFrame.src = `/?preview=true#${activeTab}`;
            const linkText = activeLink ? activeLink.textContent : 'Page';
            controlsTitle.textContent = `Editing: ${linkText}`;
            previewFrame.onload = null;
        }

        generateAdminControls(activeTab);
        adminContainer.dataset.initialized = 'true';
    }

    // --- CORE SPA NAVIGATION FUNCTION ---
    function showPage(pageId) {
        const targetId = pageId || 'home';
        pages.forEach(page => page.classList.toggle('active', page.id === targetId));
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`));
        body.classList.toggle('on-home-page', targetId === 'home');
        if (header) header.classList.remove('scrolled');
        
        if (targetId === 'admin') initializeAdminDashboard();
        else if (targetId === 'login') initializeLoginForm();
        else if (targetId === 'dashboard') initializeSubmissionForm();
        
        if (typeof L !== 'undefined' && typeof initializeInteractiveMap === 'function') {
            if (targetId === 'map') setTimeout(() => initializeInteractiveMap('leaflet-map'), 10);
            else if (targetId === 'home') setTimeout(() => initializeInteractiveMap('leaflet-map-home'), 10);
        }
    }

    // --- GENERAL EVENT LISTENERS ---
    window.addEventListener('scroll', () => {
        if (body.classList.contains('on-home-page') && header) {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const pageId = href.substring(1);
                history.pushState({ pageId }, null, `#${pageId}`);
                showPage(pageId);
            }
        });
    });

    window.addEventListener('popstate', (e) => {
        const pageId = e.state ? e.state.pageId : (location.hash.substring(1) || 'home');
        showPage(pageId);
    });

    // --- INITIAL PAGE LOAD & INITIALIZATIONS ---
    const initialPage = location.hash.substring(1) || 'home';
    showPage(initialPage);
    connectWebSocket(); // Connect to WebSocket on page load
});