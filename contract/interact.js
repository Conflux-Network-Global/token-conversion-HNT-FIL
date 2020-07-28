/* eslint-disable */

const { Conflux } = require("js-conflux-sdk");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function main() {
  const cfx = new Conflux({
    url: "http://testnet-jsonrpc.conflux-chain.org:12537",
    // defaultGasPrice: 100,
    // defaultGas: 1000000,
    // logger: console,
  });
  //
  // console.log(cfx.defaultGasPrice); // 100
  // console.log(cfx.defaultGas); // 1000000

  // ================================ Account =================================
  const account = cfx.Account(PRIVATE_KEY); // create account instance
  console.log(account.address); // 0x1bd9e9be525ab967e633bcdaeac8bd5723ed4d6b

  // ================================ Contract ================================
  // create contract instance
  const contract = cfx.Contract({
    abi: require("./abi.json"), //can be copied from remix
    address: "0x8975f507a3d577aefbfefc929c9891b529fb1398",
  });

  // get current rate
  const output = await contract.rate();
  console.log(Number(output));

  // //set current rate
  // const rateTransaction = await contract
  //   .setRate("1000000000000000000")
  //   .sendTransaction({ from: account });
  // console.log(rateTransaction);

  // submit HNT transaction and convert to FIL
  const convertTransaction = await contract
    .FIL2HIL(
      "yHbuZulfU-Hn-IzzkdmqhPeqbUcY5IXn51G9HZuYcL4",
      "t3q5z6nbg4mi4u46snrcznhtilwvxlaafcgpw7exouvvypb3vubltnjurg7jnm6frzwwsogjcmddyb3wd4u4q0"
      // "yHbuZulfU-Hn-IzzkdmqhPeqbUcY5IXn51G9HZuYcLI",
      // "t3q5z6nbg4mi4u46snrcznhtilwvxlaafcgpw7exouvvypb3vubltnjurg7jnm6frzwwsogjcmddyb3wd4u4qq"
    )
    .sendTransaction({ from: account });
  console.log(convertTransaction);
}

main().catch((e) => console.error(e));
