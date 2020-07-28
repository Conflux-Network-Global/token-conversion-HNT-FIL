/* eslint-disable */

const { Conflux, util } = require('js-conflux-sdk');
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

async function main() {
  // const defaultGasPrice = util.unit("GDrip", "Drip")(10)

  const cfx = new Conflux({
    url: 'http://testnet-jsonrpc.conflux-chain.org:12537',
    // logger: console,
  });

  // console.log(cfx.defaultGasPrice); // 100
  // console.log(cfx.defaultGas); // 1000000

  // ================================ Account =================================
  const account = cfx.Account(PRIVATE_KEY); // create account instance
  console.log(account.address);

  // ================================ Contract ================================
  // create contract instance
  const contract = cfx.Contract({
    abi: require('./abi.json'), //can be copied from remix
    bytecode: require('./bytecode.json'), //on remix, found in compilation details => web3deploy => data (should be a hex string)
    // address is empty and wait for deploy
  });

  // estimate deploy contract gas use
  const estimate = await contract.constructor().estimateGasAndCollateral();
  console.log(JSON.stringify(estimate)); // {"gasUsed":"175050","storageCollateralized":"64"}

  // deploy the contract, and get `contractCreated`
  const receipt = await contract.constructor()
    .sendTransaction({from: account});
  console.log(receipt);
  //testnet address: 0x8975f507a3d577aefbfefc929c9891b529fb1398
}

main().catch(e => console.error(e));