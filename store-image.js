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

const storeImage = async (scourceUrl, filepath, destinationUrl) => {
    await saveTempImage(scourceUrl, filepath);
    
    const tempImage = fs.readFile(`${filepath}.${extension ?? null}`);

    // const tempImage = fs.createReadStream(`${filepath}.${extension ?? null}`);

    const response = await axios.post(destinationUrl, tempImage, {headers: {}});
    console.log(response);
    return response;
};

module.exports = {
    saveTempImage,
    storeImage
};

