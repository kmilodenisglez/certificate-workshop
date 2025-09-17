const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const CertificateModule = buildModule("CertificateModule", (m) => {
  // Define the contract to deploy
  const stakingContract = m.contract("CertificateRegistry");

  // Export the deployed contract
  return { stakingContract };
});

module.exports = CertificateModule;