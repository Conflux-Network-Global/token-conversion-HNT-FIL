const { Conflux } = require("js-conflux-sdk");
const axios = require("axios").default;
const { createPow } = require("@textile/powergate-client");
const fs = require("fs");
const BN = require("bn.js");

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

const ratioHNT = new BN("100000000"); //100,000,000 bones = 1 HNT
const ratioFIL = new BN(10).pow(new BN(18)); // 1 FIL = 10^18 attoFIL

//main function
const main = async () => {
  try {
    await setupLoop(); //setup necesary connections

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
          "yHbuZulfU-Hn-IzzkdmqhPeqbUcY5IXn51G9HZuYcLI" //TODO: pass in HIL transaction hash from event
        ); //check transaction for correct parameters and amount
        console.log(received);
        if (!!received) {
          //if correct transaction exists, send FIL
          const sent = await sendFIL(
            "t3q5z6nbg4mi4u46snrcznhtilwvxlaafcgpw7exouvvypb3vubltnjurg7jnm6frzwwsogjcmddyb3wd4u4qq", //TODO: pass in FIL address from event
            "1e10" //TODO: pass in FIL amount from event and conversion
          );
          console.log(
            `${received / ratioHNT} HNT converted to ${sent / ratioFIL} FIL`
          );
        }
      }
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
    console.log(`Checking from epoch ${epoch} to epoch ${newEpoch - 2}`);
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
    return false;
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
    //send amount to specific address
    await pow.ffs.sendFil(walletsFIL[0].addr, address, amt);
    return amt;
  } catch (e) {
    console.log("FIL: ", e);
  }
};

//setup loop for initialization
const setupLoop = async () => {
  let i = 0;
  while (true) {
    const check = await powergateSetup(); //run powergate setup
    i++;
    if (check) {
      break; //if setup successful, break loop
    } else if (!check && i > 4) {
      throw new Error("Powergate instantiation failed"); //if setup unsuccessful after 5 attempts, quit
    } else {
      await pause(); //if setup incomplete, try again after pause
    }
  }
};

//pause X seconds
const pause = () =>
  new Promise((res, rej) => {
    setTimeout(() => res(), 5000);
  });

//setup powergate instance connection
const powergateSetup = async () => {
  const { status } = await pow.health.check(); //check if powergate is running correctly
  if (!status) {
    throw new Error("Powergate health check failed");
  }

  //retrieved or generate auth token for powergate
  let storedToken;
  try {
    storedToken = await fs.promises.readFile("powergateToken.json"); //read token file
    storedToken = storedToken.toString(); //convert to string
    pow.setToken(storedToken); //set up auth for powergate connection
    const { addrsList } = await pow.ffs.addrs(); //test if token is valid (otherwise regenerates)
    walletsFIL = addrsList;
    return true;
  } catch (e) {
    // console.log(e);
    const { token } = await pow.ffs.create(); //create token
    //save token to local file
    await fs.promises.writeFile("powergateToken.json", `${token}`, (err) => {
      if (err) return console.log(err);
    });
    console.log("new powergate token generated");
    return false;
  }
};

main();
