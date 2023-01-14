import Config from "../config/app"

const types = {
    EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
    ],
    Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
    ]
};

const SIGNING_DOMAIN_NAME = "USDC";
const SIGNING_DOMAIN_VERSION = "2";

const EIP712 = {
    createTypeData: function (message) {
        return {
            domain: {
                name: SIGNING_DOMAIN_NAME,
                version: SIGNING_DOMAIN_VERSION,
                verifyingContract: Config.Token.address,
                chainId: Config.netId
            },
            types: types,
            primaryType: "Permit",
            message: message
        };
    },

    signTypedData: function (web3, from, data) {
        return new Promise(async (resolve, reject) => {
            function cb(err, result) {
                if (err) {
                    return reject(err);
                }
                if (result.error) {
                    return reject(result.error);
                }

                const sig = result.result;
                const sig0 = sig.substring(2);
                const r = "0x" + sig0.substring(0, 64);
                const s = "0x" + sig0.substring(64, 128);
                const v = parseInt(sig0.substring(128, 130), 16);

                resolve({
                    data,
                    sig,
                    v,
                    r,
                    s
                });
            }
            if (web3.currentProvider.isMetaMask) {
                web3.currentProvider.sendAsync(
                    {
                        jsonrpc: "2.0",
                        method: "eth_signTypedData_v4",
                        params: [from, JSON.stringify(data)],
                        id: new Date().getTime()
                    },
                    cb
                );
            } else {
                let send = web3.currentProvider.sendAsync;
                if (!send) send = web3.currentProvider.send;
                send.bind(web3.currentProvider)(
                    {
                        jsonrpc: "2.0",
                        method: "eth_signTypedData",
                        params: [from, data],
                        id: new Date().getTime()
                    },
                    cb
                );
            }
        });
    }
};


export default EIP712