// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

contract CertificateRegistry {
    address public issuer;
    mapping(bytes32 => bool) public issued;
    event Issued(bytes32 indexed certHash, address indexed by);

    constructor() {
        issuer = msg.sender;
    }

    function issueCertificate(bytes32 certHash) external {
        require(msg.sender == issuer, "only issuer");
        issued[certHash] = true;
        emit Issued(certHash, msg.sender);
    }

    function verify(bytes32 certHash) external view returns (bool) {
        return issued[certHash];
    }
}

