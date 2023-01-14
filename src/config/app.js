import abi from "./abi";

export default {
    netId: 80001,
    rpcURL: "https://polygon-mumbai.g.alchemy.com/v2/c6Xy3gbzBAPkb0pU8bnIBKY_FDBwgDNC",
    socketURL: "wss://polygon-mumbai.g.alchemy.com/v2/c6Xy3gbzBAPkb0pU8bnIBKY_FDBwgDNC",
    Token: {
        address: "0xcBB37A3b3C90C37Ab33ed36bE59a4032A9041351",
        abi: abi.token,
    },
    Transfer: {
        address: "0xB35f3f4dD61F7f65faE2251Ed79F535e0ab4a364",
        abi: abi.transfer
    }
};


// import abi from "./abi";

// export default {
//     netId: 1,
//     rpcURL: "https://eth-mainnet.g.alchemy.com/v2/iCrssCHuX0XUdFjLXp8WzUgOE0OWvkOX",
//     socketURL: "wss://eth-mainnet.g.alchemy.com/v2/iCrssCHuX0XUdFjLXp8WzUgOE0OWvkOX",
//     Token: {
//         address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
//         abi: abi.token,
//     },
//     Transfer: {
//         address: "0xB35f3f4dD61F7f65faE2251Ed79F535e0ab4a364",
//         abi: abi.transfer
//     }
// };

