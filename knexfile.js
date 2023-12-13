module.exports = {
  client: 'pg',
  connection: {
    host: '3.139.241.123',
    user: 'read_only',
    password: 'add85e1ae930c298de24b8ae493b837e',
    database: 'production',
    port: 5432,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
};
