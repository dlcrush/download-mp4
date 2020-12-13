const Fs = require('fs');
const Path = require('path');
const Axios = require('axios');
const ProgressBar = require('progress');

if (process.argv.length > 2) {
    run();
} else {
  console.log('Must supply URL');
}

async function run() {
    let url = process.argv[2];
    let path = '/home/crush/Videos';

    console.log('run');

    const response = await Axios({
        method: 'GET',
        url: url
    });

    let matches = (response.data).match(/(https?.*?\.mp4)/);

    let fileName = matches[0].match(/(?:[^/][\d\w\.]+)$(?<=\.\w{3,4})/)[0];

    console.log('downloading', matches[0]); 

    const { data, headers} = await Axios({
        method: 'GET',
        url: matches[0],
        responseType: 'stream'
    });

    const totalLength = headers['content-length'];

    console.log('Starting download');

    const progressBar = new ProgressBar('-> downloading [:bar] :percent :etas', {
        width: 40,
        complete: '=',
        incomplete: ' ',
        renderThrottle: 1,
        total: parseInt(totalLength)
    });

    const writer = Fs.createWriteStream(
        Path.resolve(path, fileName)
    );

    data.on('data', (chunk) => progressBar.tick(chunk.length));

    data.pipe(writer);

    return;
}
