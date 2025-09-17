// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CertificateRegistry is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _nextTokenId = 1;
    
    // Mapping from token ID to certificate hash
    mapping(uint256 => bytes32) public certificateHashes;
    
    // Mapping from certificate hash to token ID
    mapping(bytes32 => uint256) public hashToTokenId;
    
    // Mapping from certificate hash to metadata URI
    mapping(uint256 => string) public tokenURIs;
    
    // Mapping from certificate hash to verification status
    mapping(bytes32 => bool) public issued;
    
    // Base URI for metadata
    string private _baseTokenURI;
    
    // Events
    event CertificateIssued(uint256 indexed tokenId, bytes32 indexed certHash, address indexed to, string metadataURI);
    event CertificateVerified(uint256 indexed tokenId, bytes32 indexed certHash, bool valid);

    constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = "http://localhost:3000/api/metadata/";
    }

    /**
     * @dev Issue a new certificate as an ERC-721 token
     * @param to The address to mint the certificate to
     * @param certHash The hash of the certificate
     * @param metadataURI The URI pointing to the certificate metadata
     */
    function issueCertificate(
        address to,
        bytes32 certHash,
        string memory metadataURI
    ) external onlyOwner returns (uint256) {
        require(hashToTokenId[certHash] == 0, "Certificate already issued");
        
        uint256 newTokenId = _nextTokenId;
        _nextTokenId++;
        
        _mint(to, newTokenId);
        certificateHashes[newTokenId] = certHash;
        hashToTokenId[certHash] = newTokenId;
        tokenURIs[newTokenId] = metadataURI;
        issued[certHash] = true;
        
        emit CertificateIssued(newTokenId, certHash, to, metadataURI);
        
        return newTokenId;
    }

    /**
     * @dev Verify a certificate by its hash
     * @param certHash The hash of the certificate to verify
     * @return valid Whether the certificate is valid
     * @return tokenId The token ID if valid, 0 if invalid
     */
    function verifyCertificate(bytes32 certHash) external view returns (bool valid, uint256 tokenId) {
        valid = issued[certHash];
        tokenId = hashToTokenId[certHash];
        return (valid, tokenId);
    }

    /**
     * @dev Get certificate hash by token ID
     * @param tokenId The token ID
     * @return The certificate hash
     */
    function getCertificateHash(uint256 tokenId) external view returns (bytes32) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return certificateHashes[tokenId];
    }

    /**
     * @dev Override tokenURI to return custom metadata URI
     * @param tokenId The token ID
     * @return The metadata URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        string memory _tokenURI = tokenURIs[tokenId];
        
        // If there is a base URI but no token URI, concatenate the tokenID to the baseURI
        if (bytes(_tokenURI).length > 0) {
            return _tokenURI;
        }
        
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString()));
    }

    /**
     * @dev Set the base URI for metadata
     * @param baseURI The new base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Get the base URI
     * @return The base URI
     */
    function getBaseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Get total number of certificates issued
     * @return The total count
     */
    function totalCertificates() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @dev Legacy function for backward compatibility
     * @param certHash The certificate hash
     * @return Whether the certificate is issued
     */
    function verify(bytes32 certHash) external view returns (bool) {
        return issued[certHash];
    }
}

