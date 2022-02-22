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

const storeImage = async (scourceUrl, filepath, destinationUrl="http://localhost:8080/images/categoryname") => {
    await saveTempImage(scourceUrl, filepath);

    const extension = scourceUrl.split(".")[url.split(".").length - 1];

    const tempImage = fs.readFileSync(`${filepath}.${extension ?? null}`, { encoding: 'base64' });

    const response = await axios.post(destinationUrl, {
        "content": JSON.stringify(tempImage)
    }, {headers: {}});

    console.log(response);
    return response; //UUID
};

module.exports = {
    saveTempImage,
    storeImage
};

