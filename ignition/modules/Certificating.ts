import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CertificateModule", (m) => {
    // Selecciona la cuenta que hará el deploy
    const deployer = m.getAccount(0);

    // Definición del contrato a desplegar
    const tokenCertRegister = m.contract(
        "CertificateRegistry",
        ["Certificate Registry", "CERT"],
        { from: deployer }
    );

    // Devuelve los contratos que se van a desplegar
    return { tokenCertRegister };
});
