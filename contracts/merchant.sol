// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import {IIdentityVerificationHubV2} from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";


contract MerchantRegistry is SelfVerificationRoot {

    struct Merchant {
        string name;
        string image;
        string farcaster;
        string website;
        bool verified;
        uint256 timestamp;
    }

    mapping(address => Merchant) public merchants;
    address public identityVerificationHubV2Address;
    bytes32 public verificationConfigId;
    SelfStructs.VerificationConfigV2 public verificationConfig;
    mapping(uint256 => uint256) public configs;
    event MerchantRegistered(address indexed merchant, string name);
    event MerchantVerified(address indexed merchant, uint256 timestamp);

    constructor(
        address _identityVerificationHubV2Address,
        string memory scopeSeed,  
        SelfUtils.UnformattedVerificationConfigV2 memory _verificationConfig
    )
        SelfVerificationRoot(_identityVerificationHubV2Address, scopeSeed)
    {
        identityVerificationHubV2Address = _identityVerificationHubV2Address;

        verificationConfig =
            SelfUtils.formatVerificationConfigV2(_verificationConfig);

        verificationConfigId =
            IIdentityVerificationHubV2(identityVerificationHubV2Address)
                .setVerificationConfigV2(verificationConfig);
    }


    function registerMerchant(
        string memory name,
        string memory image,
        string memory farcaster,
        string memory website
    ) external {
        require(bytes(name).length > 0, "Name required");

        merchants[msg.sender] = Merchant({
            name: name,
            image: image,
            farcaster: farcaster,
            website: website,
            verified: false,
            timestamp: block.timestamp
        });

        emit MerchantRegistered(msg.sender, name);
    }

    function getMerchant(address merchant)
        external
        view
        returns (Merchant memory)
    {
        return merchants[merchant];
    }

    function isMerchantVerified(address merchant)
        external
        view
        returns (bool)
    {
        return merchants[merchant].verified;
    }

    function isMerchantRegistered(address merchant)
        external
        view
        returns (bool)
    {
        return bytes(merchants[merchant].name).length > 0;
    }


    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory _output,
        bytes memory userData
    ) internal override {

        address merchant = abi.decode(userData, (address));

        require(
            bytes(merchants[merchant].name).length > 0,
            "Merchant not registered"
        );

        merchants[merchant].verified = true;
        merchants[merchant].timestamp = block.timestamp;

        emit MerchantVerified(merchant, block.timestamp);
    }


    function getConfigId(
        bytes32 ,
        bytes32 ,
        bytes memory
    )
        public
        view
        override
        returns (bytes32)
    {
        return verificationConfigId;
    }
}
