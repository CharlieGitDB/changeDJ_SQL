var connectionString;

if(process.env.DATABASE_URL != undefined) {
    connectionString = process.env.DATABASE_URL;
} else {
    connectionString = 'postgres://postgres:1234@localhost:5432/changedjdb';
}

module.exports = connectionString;
