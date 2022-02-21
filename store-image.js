const fs = require('fs');
const axios = require('axios')

const saveTempImage = async (url, filepath) => {
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    const extension = url.split(".")[url.split(".").length - 1];

    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(`${filepath}.${extension ?? null}`))
            .on('error', reject)
            .once('close', () => resolve(filepath)); 
    });
};

const storeImage = async (filepath) => {
    fs.readFile(filepath, async (err, data) => {

    const response = await axios.post();
    });
};

module.exports = saveTempImage

