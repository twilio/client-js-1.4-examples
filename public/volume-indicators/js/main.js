const callButton = document.getElementById('call-button');
const hangupButton = document.getElementById('hangup-button');
const incallButtons = document.getElementById('incall-buttons');
const inputVolumeBar = document.getElementById('mic-volume');
const precallButtons = document.getElementById('precall-buttons');
const outputVolumeBar = document.getElementById('speaker-volume');
const testMicButton = document.getElementById('test-mic-button');

let activeConnection;
let hasSetInput = false;

// Making a call is disabled until the Client is set up with a valid token.
getToken('alice').then(token => {
  Twilio.Device.ready(() => {
    callButton.disabled = false;
  });
  Twilio.Device.setup(token);
});

// Render the input/output volume bars based on the current volume
function renderVolume(volumeEl, volume) {
  let color;
  if (volume > 0.75) {
    color = 'red';
  } else if (volume > 0.50) {
    color = 'yellow';
  } else {
    color = 'green';
  }

  volumeEl.style.width = `${Math.round(volume * 100)}%`;
  volumeEl.style.backgroundColor = color;
}

const renderInputVolume = renderVolume.bind(null, inputVolumeBar);
const renderOutputVolume = renderVolume.bind(null, outputVolumeBar);

function renderBothVolumes(inputVolume, outputVolume) {
  // Only render this input's volume if we're not already rendering the input stream
  //   set by Device.audio.setInputDevice.
  if (!hasSetInput) {
    renderInputVolume(inputVolume);
  }

  renderOutputVolume(outputVolume);
}

// Make a call to the application specified in the token
Twilio.Device.connect(conn => {
  activeConnection = conn;
  incallButtons.style.display = 'block';
  precallButtons.style.display = 'none';
  conn.on('volume', renderBothVolumes);
  conn.disconnect(() => {
    incallButtons.style.display = 'none';
    precallButtons.style.display = 'block';
    conn.removeListener('volume', renderBothVolumes);
    renderBothVolumes(0, 0);
  });
});

function makeCall() {
  Twilio.Device.connect();
}

function hangUp() {
  activeConnection && activeConnection.disconnect();
}

// Testing mic before making a call using Device.audio.
function startMicTest() {
  Twilio.Device.audio.setInputDevice('default').then(() => {
    Twilio.Device.audio.on('inputVolume', renderInputVolume);
    testMicButton.innerText = 'Stop Testing';
    testMicButton.onclick = stopMicTest;
    hasSetInput = true;
  });
}

function stopMicTest() {
  Twilio.Device.audio.unsetInputDevice();
  Twilio.Device.audio.removeListener('inputVolume', renderInputVolume);
  testMicButton.innerText = 'Test Mic';
  testMicButton.onclick = startMicTest;
  renderInputVolume(0);
  hasSetInput = false;
}

testMicButton.onclick = startMicTest;
callButton.onclick = makeCall;
hangupButton.onclick = hangUp;
