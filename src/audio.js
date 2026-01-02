export let audioContext;
export let analyser;
export let dataArray;
let source;

export function setupAudio(file) {
    if (audioContext) {
        audioContext.close();
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512; // Controls resolution. 256 bars.

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
        fileReader.onload = function (e) {
            const arrayBuffer = e.target.result;
            audioContext.decodeAudioData(arrayBuffer, (buffer) => {
                if (source) source.disconnect();

                source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.loop = true;

                source.connect(analyser);
                analyser.connect(audioContext.destination);

                source.start(0);
                resolve({ audioContext, analyser, dataArray });
            }, (err) => reject(err));
        };

        fileReader.readAsArrayBuffer(file);
    });
}

export function getAudioData() {
    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        return dataArray;
    }
    return null;
}

