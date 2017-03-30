const callButton = document.getElementById('call-button');
const testMicButton = document.getElementById('test-mic-button');

// Create VolumeIndicators for input/output streams and append them to the page.
const micIndicator = new VolumeIndicator();
document.getElementById('mic-wrapper').appendChild(micIndicator.element);

const speakerIndicator = new VolumeIndicator();
document.getElementById('speaker-wrapper').appendChild(speakerIndicator.element);

// Making a call and testing mic are disabled until the Client is set up with a valid token.
getToken('alice').then(token => {
  Twilio.Device.ready(() => {
    callButton.disabled = false;
    testMicButton.disabled = false;
  });

  Twilio.Device.setup(token);
});

// Bind call button to make a call and set up volume indicators
callButton.onclick = makeCall;

function makeCall() {
  stopMicTest();
  Twilio.Device.connect();
}

Twilio.Device.connect(conn => {
  showIncallUI();

  conn.on('volume', setVolumes);

  conn.disconnect(() => {
    showPrecallUI();
    conn.removeListener('volume', setVolumes);
    setVolumes(0, 0);
  });

  document.getElementById('hangup-button').onclick = function() {
    conn.disconnect();
  }
});

function setVolumes(inputVolume, outputVolume) {
  micIndicator.setVolume(inputVolume);
  speakerIndicator.setVolume(outputVolume);
}

// Bind Test Mic button to get user media and set up the volume indicator.
testMicButton.onclick = startMicTest;

function setInputVolume(volume) {
  micIndicator.setVolume(volume);
}

function startMicTest() {
  Twilio.Device.audio.setInputDevice('default').then(() => {
    Twilio.Device.audio.on('inputVolume', setInputVolume);
    testMicButton.innerText = 'Stop Testing';
    testMicButton.onclick = function() {
      Twilio.Device.audio.unsetInputDevice();
      stopMicTest();
    };
  });
}

function stopMicTest() {
  Twilio.Device.audio.removeListener('inputVolume', setInputVolume);
  testMicButton.innerText = 'Test Mic';
  testMicButton.onclick = startMicTest;
  setInputVolume(0);
}

// UI stuff
const incallButtons = document.getElementById('incall-buttons');
const precallButtons = document.getElementById('precall-buttons');

function showIncallUI() {
  incallButtons.style.display = 'block';
  precallButtons.style.display = 'none';
}

function showPrecallUI() {
  incallButtons.style.display = 'none';
  precallButtons.style.display = 'block';
}
