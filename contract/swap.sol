pragma solidity ^0.6.0;

contract swap {
    address owner;
    event convert(string transactionHNT, string addressFIL, uint256 rate);
    uint256 public rate; //rate/1e18 = $HNT/$FIL = amount FIL to buy 1 HNT
    mapping (bytes32 => bool) FILtransactions;

    constructor() public {
        owner = msg.sender;
    }

    //initiatve conversion
    function HNT2FIL (string calldata _transaction, string calldata _address) external {
        //checking lengths of inputs
        require(bytes(_transaction).length == 43, "HNT transaction hash incorrect");
        require(bytes(_address).length == 86, "FIL address invalid");

        bytes32 transactionHash = keccak256(abi.encode(_transaction));
        require(FILtransactions[transactionHash] == false, "HNT transaction has been claimed");
        FILtransactions[transactionHash] = true; //use the hash of the transaction hash to track if transaction has been claimed

        emit convert(_transaction, _address, rate); //event picked up by server
    }

    //set rate for conversion
    function setRate (uint256 _rate) external {
        require(msg.sender == owner, "not owner");
        rate = _rate;
    }

}
