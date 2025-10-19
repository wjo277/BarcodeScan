
let selectedDeviceId;
const codeReader = new ZXing.BrowserMultiFormatReader();
let map;

function startScan() {
    codeReader.decodeOnceFromVideoDevice(selectedDeviceId, 'video').then(result => {
        const barcode = result.text;
        const timestamp = new Date().toISOString();
        navigator.geolocation.getCurrentPosition(pos => {
            const latitude = pos.coords.latitude;
            const longitude = pos.coords.longitude;
            const config = JSON.parse(localStorage.getItem('config'));
            const payload = {
                barcode,
                timestamp,
                latitude,
                longitude
            };
            fetch(`https://script.google.com/macros/s/${config.sheetId}/exec`, {
                method: 'POST',
                body: JSON.stringify(payload)
            }).then(res => res.text()).then(txt => {
                document.getElementById('output').innerText = `${timestamp}
${barcode}`;
            });
        });
    });
}

function scanConfig() {
    codeReader.decodeOnceFromVideoDevice(selectedDeviceId, 'video').then(result => {
        localStorage.setItem('config', result.text);
        document.getElementById('output').innerText = 'Konfiguration gespeichert';
    });
}

function searchEntries() {
    const searchValue = document.getElementById('searchValue').value;
    const config = JSON.parse(localStorage.getItem('config'));
    fetch(`https://script.google.com/macros/s/${config.sheetId}/exec?search=${encodeURIComponent(searchValue)}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('output').innerText = `${data.length} Einträge gefunden.`;
            if (!map) {
                map = L.map('map').setView([0, 0], 2);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap'
                }).addTo(map);
            }
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) map.removeLayer(layer);
            });
            data.forEach(entry => {
                if (entry.latitude && entry.longitude) {
                    L.marker([entry.latitude, entry.longitude]).addTo(map)
                        .bindPopup(entry.barcode + '<br>' + entry.timestamp);
                }
            });
        });
}

codeReader.listVideoInputDevices().then(videoInputDevices => {
    const backCamera = videoInputDevices.find(device => device.label.toLowerCase().includes('back'));
    selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId;
});
