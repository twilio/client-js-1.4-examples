const testMicButton = document.getElementById('test-mic-button');
const waveform = new Waveform();

document.getElementById('visualizer').appendChild(waveform.element);

// Making a call is disabled until the Client is set up with a valid token.
getToken('alice').then(token => {
  Twilio.Device.ready(() => {
    testMicButton.disabled = false;
  });
  Twilio.Device.setup(token);
});

// Testing mic before making a call using Device.audio.
function startMicTest() {
  Twilio.Device.audio.setInputDevice('default').then(() => {
    testMicButton.innerText = 'Stop Testing';
    testMicButton.onclick = stopMicTest;

    waveform.setStream(Twilio.Device.audio.inputStream);
  });
}

function stopMicTest() {
  Twilio.Device.audio.unsetInputDevice();
  testMicButton.innerText = 'Test Mic';
  testMicButton.onclick = startMicTest;

  waveform.unsetStream();
}

testMicButton.onclick = startMicTest;
