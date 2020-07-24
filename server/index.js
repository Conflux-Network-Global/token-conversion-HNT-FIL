const { Conflux } = require("js-conflux-sdk");
const axios = require("axios").default;
const { createPow } = require("@textile/powergate-client");
const fs = require("fs");

//global variables
const walletHNT = "13mCuVY4A3TUb2BuXeTq8KqBFKEZwEwKfTKPgc9KAZ39WsLuBhy"; //HNT wallet address

let epoch; //current epoch - used to track event logs
const cfx = new Conflux({
  url: "http://testnet-jsonrpc.conflux-chain.org:12537",
  // logger: console,
}); //conflux instance

const host = "http://0.0.0.0:6002"; //powergate IP
const pow = createPow({ host }); //powergate instance
let walletsFIL;

//main function
const main = async () => {
  try {
    await powergateSetup(); //setup powergate connection

    //setup initial epoch number
    epoch = await cfx.getEpochNumber();
    epoch = epoch - 10; //go back 10 to elimate overlap when checking CFX logs

    //loop for checking and conducting atomic swaps
    const loop = async () => {
      const eventCheck = await cfxCheck(); //check for new events from CFX contract
      console.log(eventCheck);

      if (!!eventCheck) {
        //when a new log is found
        const received = await hilCheck(
          "yHbuZulfU-Hn-IzzkdmqhPeqbUcY5IXn51G9HZuYcLI"
        ); //check transaction for correct parameters and amount
        console.log(received);
        if (!!received) {
          //if correct transaction exists, send FIL
          const sent = await sendFIL(
            "t3q5z6nbg4mi4u46snrcznhtilwvxlaafcgpw7exouvvypb3vubltnjurg7jnm6frzwwsogjcmddyb3wd4u4qq",
            100000
          );
        }
      }
      console.log("HNT converted to FIL");
    };
    // setInterval(loop, 5000); //run in a loop
    loop();
  } catch (e) {
    console.log("main: ", e);
  }
};

//check if event is emitted on Conflux
const cfxCheck = async () => {
  try {
    const newEpoch = await cfx.getEpochNumber(); //get epoch when checked

    const logs = await cfx.getLogs({
      //get logs at address
      address: "0xbd72de06cd4a94ad31ed9303cf32a2bccb82c404",
      fromEpoch: epoch,
      toEpoch: newEpoch - 2, //subtract two to prevent errors with block not mined yet
    });
    console.log("CFX", logs);

    //TODO: deploy smart contract for testing + event decoding using ABI
    // smart contract

    epoch = newEpoch - 1; //only subtract 1 because the to/from in get logs is inclusive (no duplicate blocks)
    return true; //TODO: return event parameters
  } catch (e) {
    console.log("CFX: ", e);
  }
};

//check Helium transaction (API request and verify transaction)
const hilCheck = async (transaction) => {
  try {
    console.log("HNT");
    const data = await axios.get(
      //api request to Helium
      `https://api.helium.io/v1/transactions/${transaction}`
    );
    // console.log(data.data.data);
    const paymentDetails = data.data.data;

    let output = false;
    if (paymentDetails.payments[0].payee === walletHNT) {
      //check that transaction sent to correct address
      output = paymentDetails.payments[0].amount; //amount in bones (100,000,000 bones = 1 HNT)
    }
    return output; //return bone (HNT) amount
  } catch (e) {
    console.log("HNT: ", e);
  }
};

//send FIL to correct address using powergate
const sendFIL = async (address, amt) => {
  try {
    //TODO: send FIL to specific address
    await pow.ffs.sendFil(walletsFIL[0].addr, address, amt)

    console.log("FIL");
  } catch (e) {
    console.log("FIL: ", e);
  }
};

//setup powergate instance connection
const powergateSetup = async () => {
  const { status } = await pow.health.check(); //check if powergate is running correctly
  if (!status) {
    throw new Error("Powergate health check failed");
  }

  //retrieved or generate auth token for powergate
  let storedToken;
  try {
    storedToken = require("./powergateToken"); //import auth token
    pow.setToken(storedToken); //set up auth for powergate connection
    const { addrsList } = await pow.ffs.addrs(); //test if token is valid (otherwise regenerates)
    walletsFIL = addrsList;
  } catch (e) {
    const { token } = await pow.ffs.create(); //create token
    //save token to local file
    await fs.promises.writeFile("powergateToken.json", `"${token}"`, (err) => {
      if (err) return console.log(err);
    });
    console.log("new powergate token generated");
    await powergateSetup();
  }

};

main();
