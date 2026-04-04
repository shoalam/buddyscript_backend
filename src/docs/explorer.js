const container = document.getElementById('explorer-container');

let apiData = null;

async function init() {
    try {
        const response = await fetch('/api/docs/apiData');
        apiData = await response.json();
        render();
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger mx-auto mt-5">Failed to load API metadata: ${err.message}</div>`;
    }
}

function render() {
    if (!apiData) return;

    apiData.endpoints.forEach((group, gIdx) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'group-container';

        const groupHeader = `
            <div class="group-header">
                <h2>${group.group}</h2>
                <div class="count-badge">${group.items.length}</div>
            </div>
        `;
        groupDiv.innerHTML = groupHeader;

        group.items.forEach((item, iIdx) => {
            const apiId = `api-${gIdx}-${iIdx}`;
            const row = document.createElement('div');
            row.className = 'api-row';
            row.setAttribute('data-target', apiId);
            row.innerHTML = `
                <div class="method-badge method-${item.method}">${item.method}</div>
                <div class="api-path">${item.path}</div>
                <div class="status-badge status-${item.isProtected ? 'PROTECTED' : 'PUBLIC'}">${item.isProtected ? 'Protected' : 'Public'}</div>
            `;
            groupDiv.appendChild(row);

            // Detailed Section
            const detailSection = document.createElement('div');
            detailSection.className = 'api-details';
            detailSection.id = apiId;
            detailSection.innerHTML = `
                <p class="text-secondary mb-4 small">${item.desc}</p>
                <div class="detail-section yellow-section">
                    <div class="section-title">📊 Database Schema</div>
                    <div class="technical-info">
                        <div class="info-row"><span class="info-label">Main Table:</span> ${item.mainTable}</div>
                        <div class="info-row"><span class="info-label">Required Fields:</span> ${item.requiredFields.join(', ') || 'None'}</div>
                    </div>
                    <div class="side-effects">
                        <div class="side-effects-title">⚠️ Side Effects:</div>
                        <div class="small">${item.sideEffects}</div>
                    </div>
                </div>

                <div class="detail-section blue-section">
                    <div class="section-title">✅ Sample Request URLs & Responses</div>
                    <div class="info-row small mb-2"><span class="info-label">Request:</span> ${item.method} ${item.path}</div>
                    ${item.body ? `
                        <div class="info-label small mb-2">Request Body:</div>
                        <textarea id="body-${apiId}" class="form-control mb-3" style="font-family:monospace; font-size:0.8rem; height:150px;">${JSON.stringify(item.body, null, 2)}</textarea>
                    ` : ''}
                    
                    ${(item.path === '/api/posts' && item.method === 'POST') ? `
                        <div class="info-label small mb-2">Media Upload (image):</div>
                        <input type="file" id="file-${apiId}" class="form-control mb-3">
                    ` : ''}

                    <div class="action-container">
                        <button class="btn-send" data-api-id="${apiId}" data-gidx="${gIdx}" data-iidx="${iIdx}">SEND REQUEST</button>
                    </div>

                    <div id="resp-${apiId}" class="response-container mt-4">
                        <div class="text-muted small mb-2">Response Output:</div>
                        <pre id="output-${apiId}"></pre>
                    </div>
                </div>
            `;
            groupDiv.appendChild(detailSection);
        });

        container.appendChild(groupDiv);
    });

    attachListeners();
}

function attachListeners() {
    // Row expansion
    document.querySelectorAll('.api-row').forEach(row => {
        row.onclick = () => {
            const targetId = row.getAttribute('data-target');
            const detail = document.getElementById(targetId);
            const isVisible = detail.style.display === 'block';

            // Collapse all others if needed (optional)
            // document.querySelectorAll('.api-details').forEach(d => d.style.display = 'none');

            detail.style.display = isVisible ? 'none' : 'block';
        };
    });

    // Send Button logic
    document.querySelectorAll('.btn-send').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const apiId = btn.getAttribute('data-api-id');
            const gIdx = btn.getAttribute('data-gidx');
            const iIdx = btn.getAttribute('data-iidx');
            const item = apiData.endpoints[gIdx].items[iIdx];

            const outputContainer = document.getElementById(`resp-${apiId}`);
            const outputArea = document.getElementById(`output-${apiId}`);
            const originalBtnText = btn.textContent;

            btn.disabled = true;
            btn.textContent = 'SENDING...';
            outputContainer.style.display = 'block';
            outputArea.textContent = 'Waiting for response...';
            outputArea.style.color = '#343a40';

            try {
                let options = {
                    method: item.method,
                    credentials: 'include'
                };

                let url = `${apiData.baseUrl}${item.path}`;

                // Handle URL params like :id
                if (url.includes(':')) {
                    const param = prompt("Enter the ID for this request:", "65f...");
                    if (param) {
                        url = url.replace(/:[a-zA-Z]+/, param);
                    }
                }

                if (item.method !== 'GET') {
                    const fileInput = document.getElementById(`file-${apiId}`);
                    const bodyInput = document.getElementById(`body-${apiId}`);

                    if (fileInput && fileInput.files[0]) {
                        const formData = new FormData();
                        if (bodyInput) {
                            const body = JSON.parse(bodyInput.value);
                            Object.keys(body).forEach(key => formData.append(key, body[key]));
                        }
                        formData.append('image', fileInput.files[0]);
                        options.body = formData;
                    } else if (bodyInput) {
                        options.headers = { 'Content-Type': 'application/json' };
                        options.body = bodyInput.value;
                    }
                }

                const response = await fetch(url, options);
                const data = await response.json();

                outputArea.textContent = JSON.stringify(data, null, 2);
                outputArea.style.color = response.ok ? '#28a745' : '#dc3545';
            } catch (err) {
                outputArea.textContent = `Error: ${err.message}`;
                outputArea.style.color = '#dc3545';
            } finally {
                btn.disabled = false;
                btn.textContent = originalBtnText;
            }
        };
    });
}

init();
