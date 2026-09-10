const dotenv = require('dotenv');
dotenv.config();

const { connectToDatabase } = require('./src/db/db.js');
const app = require('./src/app.js');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectToDatabase();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();