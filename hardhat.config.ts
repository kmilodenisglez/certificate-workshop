import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "@nomicfoundation/hardhat-typechain";

import * as dotenv from "dotenv";
dotenv.config(); // carga las variables de .env

// Make sure you have these environment variables in your .env file
// POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
// PRIVATE_KEY=your-metamask-private-key
// POLYGONSCAN_API_KEY=your-polygonscan-api-key

const config: HardhatUserConfig = {
    plugins: [hardhatToolboxMochaEthersPlugin],
    solidity: {
        profiles: {
            default: {
                version: "0.8.28"
            },
            production: {
                version: "0.8.28",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        }
    },
    networks: {
        amoy: {
            type: "http",
            url: process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
            accounts: [process.env.PRIVATE_KEY || ""],
            chainId: 80002,
            gasPrice: 1000000000 // 1 gwei
        },
        localhost: {
            type: "http",
            url: process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545",
            chainId: 31337,
            accounts: [process.env.PRIVATE_KEY || ""]
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
    typechain: {
        outDir: "typechain-types",
        alwaysGenerateOverloads: false,
        dontOverrideCompile: false
    }
};

export default config;

