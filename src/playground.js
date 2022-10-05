const fetch = require("node-fetch");
const key = "9_w25dPpnMio1K3JY9FifDnL1U7rlaP2";
const baseURL = `https:/polygon-mumbai.g.alchemy.com/nft/v2/${key}/getNFTMetadata`;
const contractAddr = "0x5147E15E6a37D346E0142492c63D6f660b5C9bd3";
const tokenId = "1";
const tokenType = "erc115";

const fetchURL = `${baseURL}?contractAddress=${contractAddr}&tokenId=${tokenId}&tokenType=${tokenType}`;

fetch(fetchURL, {
  method: "GET",
  redirect: "follow",
})
  //   .then((response) => response.json())
  //   .then((response) => JSON.stringify(response, null, 2))
  .then((result) => console.log(result))
  .catch((error) => console.log("error", error));
