const babcoin_db = "babcoin";
const uri = process.env.MONGODB_URI + "/" + babcoin_db;

module.exports = {
    uri: uri
};