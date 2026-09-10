const ImageKit = require('@imagekit/nodejs');
const { toFile } = ImageKit;

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadImage(imageBuffer, fileName = 'image.jpg') {
    try {
        // Convert Buffer to an uploadable File using @imagekit/nodejs helper
        const file = await toFile(imageBuffer, fileName);

        const result = await imagekit.files.upload({
            file,
            fileName,
        });

        console.log(`\nUploaded image URL: ${result.url}\n`);

        return result;
    } catch (error) {
        console.error('Error uploading to Imagekit:', error);
        throw error;
    }
}

module.exports = { uploadImage, imagekit };