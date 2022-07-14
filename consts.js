const babcoin_db = "babcoin";
const options = "?retryWrites=true&w=majority";
const uri = "mongodb+srv://babcoin:ZeTpdfO5y2IF8an0@babcoincluster0.hnedh.mongodb.net/" + babcoin_db + options;
//const uri = process.env.MONGODB_URI + "/" + babcoin_db;

module.exports = {
    uri: uri
};