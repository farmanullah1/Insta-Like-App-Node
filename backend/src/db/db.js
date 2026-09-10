const sql = require("mssql/msnodesqlv8");

const masterConfig = {
    connectionString:
        `Driver={ODBC Driver 18 for SQL Server};` +
        `Server=${process.env.SERVER};` +
        `Database=master;` +
        `Trusted_Connection=Yes;` +
        `TrustServerCertificate=Yes;`
};

const targetConfig = {
    connectionString:
        `Driver={ODBC Driver 18 for SQL Server};` +
        `Server=${process.env.SERVER};` +
        `Database=${process.env.DATABASE};` +
        `Trusted_Connection=Yes;` +
        `TrustServerCertificate=Yes;`
};

let pool;
async function connectToDatabase() {
    let masterPool;

    try {
        // ---------------------------------------------------
        // 1. Connect to 'master' to check/create the database
        // ---------------------------------------------------
        masterPool = await sql.connect(masterConfig);


        const dbName = process.env.DATABASE;
        const result = await masterPool.request().query(`
            SELECT 1 FROM sys.databases WHERE name = '${dbName}'
        `);

        if (result.recordset.length === 0) {
            console.log(`Database '${dbName}' not found. Creating...`);
            await masterPool.request().query(`CREATE DATABASE [${dbName}]`);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }

        await masterPool.close();

        pool = await sql.connect(targetConfig);
        console.log("Connected to target database successfully");

        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Posts')
            BEGIN
                CREATE TABLE Posts (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    Post_Image VARBINARY(MAX) NULL,
                    Caption NVARCHAR(255) NOT NULL,
                    Image_Url NVARCHAR(MAX) NULL,
                    Likes INT NOT NULL DEFAULT 0,
                    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
                );
            END
            ELSE
            BEGIN
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Posts' AND COLUMN_NAME = 'Image_Url')
                BEGIN
                    ALTER TABLE Posts ADD Image_Url NVARCHAR(MAX) NULL;
                END
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Posts' AND COLUMN_NAME = 'Likes')
                BEGIN
                    ALTER TABLE Posts ADD Likes INT NOT NULL DEFAULT 0;
                END
                IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Posts' AND COLUMN_NAME = 'CreatedAt')
                BEGIN
                    ALTER TABLE Posts ADD CreatedAt DATETIME NOT NULL DEFAULT GETDATE();
                END
                ALTER TABLE Posts ALTER COLUMN Post_Image VARBINARY(MAX) NULL;
            END

            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Comments')
            BEGIN
            CREATE TABLE Comments (
                id INT IDENTITY(1,1) PRIMARY KEY,
                PostId INT NOT NULL,
                Author NVARCHAR(100) NOT NULL DEFAULT 'Community Member',
                Text NVARCHAR(500) NOT NULL,
                CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
                CONSTRAINT FK_Comments_Posts FOREIGN KEY (PostId) REFERENCES Posts(id) ON DELETE CASCADE
            );
        END
    `);
    console.log("Tables 'Posts' and 'Comments' ensured.");
        return pool;
    } catch (error) {
        console.error("Database connection/setup failed:", error);
        // If we fail here, close the master pool if it's still open
        if (masterPool) await masterPool.close().catch(() => { });
        throw error;
    }
}

async function getPool() {
    if (!pool) {
        await connectToDatabase();
    }
    return pool;
}

module.exports = { connectToDatabase, getPool };
