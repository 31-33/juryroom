var ibmdb = require('ibm_db');
const dsn = "DATABASE=BLUDB;HOSTNAME=dashdb-txn-sbox-yp-dal09-03.services.dal.bluemix.net;PORT=50000;PROTOCOL=TCPIP;UID=tcq10646;PWD=0jdwn7k3v^qjrjff;";
// Holds the reference to the client. Used to close the connections,
let client = null;

// Holds the current connection to repository
let db = null;

// WARNING: System might behave unexpectedly if the configs from `repositorySchemaBuilder`
// and this file do not match
// For example, if you are setting `.setCollectionName('my_users') `
// Then, you should use the same collection in this file as well
// ( schema is returned from `build` method. You might want to use that)

const connect = () => new Promise((resolve, reject) => {
  console.log("ATTEMPTING CONNECTION");
  // Logic to connect to the database and save the connection reference in client variable
  //https://console.bluemix.net/docs/services/Db2onCloud/index.html#getting_started_db2oncloud
  // process.env.vcap["dashDB"][0]["credentials"]["dsn"];
  ibmdb.open(dsn, (err, conn) => {
    if(err) console.log(err);
    else db = conn;
  });
});

const disconnect = () => new Promise((resolve, reject) => {
  db.close(() => console.log('database connection closed'));
    // Logic to disconnect
});

const exists = key => new Promise(async (resolve, reject) => {
    // Logic to find whether the object with key exists in
    // database or not
    // Key is the unique you set for the user configuration
    // by default it is 'username'

    // The promise must resolve in either true ( if exists ) or false
    console.log("exists")
});


const create = object => new Promise(async (resolve, reject) => {
    // Logic to add the object passed in the user collection
    // This method will be used at time of sign up
});


const find = ({ key }) => new Promise(async (resolve, reject) => {
    // Logic to find the object. The object must have one parameter which is key
    // The key passed will be matched against the user collection.
    // It is used while loggin in the user.
    // For example,
    // query = {
    //     key: 'someone@gmail.com'
    // };
    // find(query)
    // And user with that email will be returned

    // The promise must resolve to user object if found or resolve to any falsy value otherwise (`null` for example).
});


const update = (key, updates) => new Promise(async (resolve, reject) => {
    // Logic to find and update the object.
    // Match the user collection against key
    // And if a user is found,
    // patch the updates
    // This is only used to update time of logged_in_at in meta
});

module.exports = {
    connect, exists, create, find, update, disconnect, dsn
};
