async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    // Get the deployer's balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance));
  
    // Deploy the Certificate Registry contract
    const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    const certificateRegistry = await CertificateRegistry.deploy(
        "Certificate Registry", // name
        "CERT" // symbol
    );
    await certificateRegistry.waitForDeployment();
  
    const contractAddress = await certificateRegistry.getAddress();
    console.log("Certificate Registry deployed to:", contractAddress);
    
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);
    
    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        chainId: network.chainId.toString(),
        contractAddress: contractAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString()
    };
    
    console.log("\n=== Deployment Summary ===");
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    // Verify contract on PolygonScan if on Amoy testnet
    if (network.chainId === 80002n) {
        console.log("\nTo verify the contract on PolygonScan, run:");
        console.log(`npx hardhat verify --network amoy ${contractAddress} "Certificate Registry" "CERT"`);
    }
  }
  
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  