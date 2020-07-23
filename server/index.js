const { Conflux } = require("js-conflux-sdk");
const axios = require('axios').default;

let epoch;
const cfx = new Conflux({
  url: "http://testnet-jsonrpc.conflux-chain.org:12537",
  // logger: console,
});

const main = async () => {
  try {
    epoch = await cfx.getEpochNumber();
    epoch = epoch-10;

    const loop = async () => {
      const eventCheck = await cfxCheck();
      console.log(eventCheck);

      if (!!eventCheck) {
        const received = await hilCheck("1YOU0JEZ_7SBtbL1Iaj0rnIeMN9ONpUv_b9VdtfiAzs");
        if (!!received) {
          const sent = await sendFIL();
        }
      }
      console.log("HNT converted to FIL", epoch);
    };
    // setInterval(loop, 5000);
    loop();
  } catch (e) {
    console.log("main: ", e);
  }
};

const cfxCheck = async () => {
  try {
    const newEpoch = await cfx.getEpochNumber();

    const logs = await cfx.getLogs({
      address: "0xbd72de06cd4a94ad31ed9303cf32a2bccb82c404",
      fromEpoch: epoch,
      toEpoch: newEpoch-2, //subtract two to prevent errors with block not mined yet
    });
    console.log("CFX", logs);

    //TODO: deploy smart contract for testing + event decoding using ABI

    epoch = newEpoch-1; //only subtract 1 because the to/from in get logs is inclusive (no duplicate blocks)
    return true;
  } catch (e) {
    console.log("CFX: ", e);
  }
};

const hilCheck = async (transaction) => {
  try {
    console.log("HNT");
    const data = await axios.get(`https://api.helium.io/v1/transactions/${transaction}`);
    console.log(data.data.data);

    //TODO: filtering based on transaction data (need transaction parameters)

    return true;
  } catch (e) {
    console.log("HNT: ", e);
  }
};

const sendFIL = async (address) => {
  try {
    console.log("FIL");
  } catch (e) {
    console.log("FIL: ", e);
  }
};

main();
