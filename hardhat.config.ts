import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable } from "hardhat/config";

import * as dotenv from "dotenv";
dotenv.config(); // carga las variables de .env


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
        testnet: {
            type: "http",
            url: process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
            accounts: [process.env.PRIVATE_KEY || ""]
        },
        localhost: {
            type: "http",
            url: process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545",
            chainId: 31337,
            accounts: [process.env.PRIVATE_KEY || ""]
        },
    }

};

export default config;
