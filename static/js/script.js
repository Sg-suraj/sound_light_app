const startButton = document.getElementById('startButton');
const lightDisplay = document.getElementById('light-display');

startButton.addEventListener('click', initialize);

function initialize() {
    console.log('Start button clicked. Requesting microphone access...');
    startButton.style.display = 'none';

    const socket = io();
    socket.on('connect', () => {
        console.log('Successfully connected to server!');
    });

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((stream) => {
            console.log('Microphone access granted!');
            
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            function processAudio() {
                analyser.getByteFrequencyData(dataArray);
                
                // Find the loudest frequency band
                let maxVal = -1;
                let maxIndex = -1;
                for (let i = 0; i < dataArray.length; i++) {
                    if (dataArray[i] > maxVal) {
                        maxVal = dataArray[i];
                        maxIndex = i;
                    }
                }

                // Send the dominant frequency index and its volume to the server
                socket.emit('audio_data', { frequency_index: maxIndex, volume: maxVal });

                requestAnimationFrame(processAudio);
            }

            processAudio();

            socket.on('color_change', (data) => {
                lightDisplay.style.backgroundColor = data.color;
            });

        })
        .catch((err) => {
            console.error('Error accessing microphone:', err);
            startButton.style.display = 'block';
            alert('Error: Could not access the microphone.');
        });
}