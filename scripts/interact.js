const hre = require("hardhat");
const { ethers } = require("ethers");

// Example usage:
// npx hardhat run scripts/interact.js --network localhost
// npx hardhat run scripts/interact.js --network amoy

async function main() {
    // Replace with your deployed contract address
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update this with actual address
    const [signer] = await hre.ethers.getSigners();

    console.log("Interacting with contract using account:", signer.address);

    const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
    const certificateRegistry = CertificateRegistry.attach(contractAddress);

    // Get contract info
    console.log("Contract Name:", await certificateRegistry.name());
    console.log("Contract Symbol:", await certificateRegistry.symbol());
    console.log("Total Certificates:", await certificateRegistry.totalCertificates());
    console.log("Owner:", await certificateRegistry.owner());

    // Example: Issue a certificate
    const recipientAddress = signer.address; // In real scenario, this would be the certificate recipient
    const certificateHash = ethers.keccak256(ethers.toUtf8Bytes("Sample Certificate Data"));
    const metadataURI = "http://localhost:3000/api/metadata/1";

    console.log("\n=== Issuing Certificate ===");
    console.log("Recipient:", recipientAddress);
    console.log("Certificate Hash:", certificateHash);
    console.log("Metadata URI:", metadataURI);

    try {
        const tx = await certificateRegistry.issueCertificate(
            recipientAddress,
            certificateHash,
            metadataURI
        );
        await tx.wait();
        console.log("Certificate issued successfully! TX:", tx.hash);

        // Verify the certificate
        const [isValid, tokenId] = await certificateRegistry.verifyCertificate(certificateHash);
        console.log("\n=== Verification ===");
        console.log("Is Valid:", isValid);
        console.log("Token ID:", tokenId.toString());

        if (isValid) {
            console.log("Token URI:", await certificateRegistry.tokenURI(tokenId));
            console.log("Certificate Hash from Token:", await certificateRegistry.getCertificateHash(tokenId));
        }

    } catch (error) {
        console.error("Error issuing certificate:", error.message);
    }

    // Example: Verify a certificate by hash
    console.log("\n=== Verifying Certificate by Hash ===");
    const testHash = ethers.keccak256(ethers.toUtf8Bytes("Test Certificate"));
    const [isValidTest, tokenIdTest] = await certificateRegistry.verifyCertificate(testHash);
    console.log("Test Hash:", testHash);
    console.log("Is Valid:", isValidTest);
    console.log("Token ID:", tokenIdTest.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});