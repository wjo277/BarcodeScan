
let selectedDeviceId;
const codeReader = new ZXing.BrowserMultiFormatReader();

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
                document.getElementById('output').innerText = 'Gesendet: ' + txt;
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

codeReader.listVideoInputDevices().then(videoInputDevices => {
    selectedDeviceId = videoInputDevices[0].deviceId;
});
