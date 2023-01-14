import React, { useCallback, useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
import {
    Button,
    Skeleton,
    Typography,
    Box,
    TextField,
    Stack,
} from "@mui/material";
//web3
import Web3 from "web3";
import { useWeb3React } from "@web3-react/core";
//file
import Config from "../config/app";
import Cwallet from "../components/Cwallet";
import EIP712 from "./EIP712"
import axios from "axios";

const options = {
    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false,
    },
}

const Home = () => {
    // eslint-disable-next-line
    const { active, account, library } = useWeb3React();
    const [isOpenDialog, setIsOpenDialog] = useState(false);
    const [amount, setAmount] = useState(10);
    const [balance, setBalance] = useState(0);
    const [baseFee, setBaseFee] = useState(0);
    const [recipient, setRecipient] = useState("0x4ad0845a2dde6f48abb5b3146736e8f2a614dc49");
    const price = 1;
    const gasLimit = 100000;

    const transfer = async () => {
        console.log("======Transfer======")
        if (Number(Number(((baseFee / 10 ** 18) * 60000 * price).toFixed(0)) + 1) >= Number(amount)) {
            alert("Amount is low")
            return;
        }

        try {
            const SECOND = 1000;
            const web3 = new Web3(library.provider);
            const TokenContract = new web3.eth.Contract(
                Config.Token.abi,
                Config.Token.address
            );
            const nonce = await TokenContract.methods.nonces(account).call();
            const deadline = Math.trunc((Date.now() + 120 * SECOND) / SECOND);
            const value = amount * 10 ** 6;
            const data = {
                owner: account,
                spender: Config.Transfer.address,
                value,
                nonce,
                deadline
            }

            const createdData = EIP712.createTypeData(data)
            const { v, r, s } = await EIP712.signTypedData(web3, account, createdData)

            const SocketWeb3 = new Web3(
                new Web3.providers.WebsocketProvider(
                    Config.socketURL,
                    options,
                ),
            );
            SocketWeb3.eth.accounts.wallet.add(process.env.REACT_APP_PRIVATE_KEY)
            const socketAccount = SocketWeb3.eth.accounts.privateKeyToAccount(process.env.REACT_APP_PRIVATE_KEY)

            const TransferSocketContract = new SocketWeb3.eth.Contract(
                Config.Transfer.abi,
                Config.Transfer.address
            );

            const block = await web3.eth.getBlock("latest");
            const gasPrice = await web3.eth.getGasPrice()

            console.log(gasLimit, 'gasLimit')
            console.log(gasPrice, 'gasPrice')

            const gasFee = ((gasLimit * gasPrice / 10 ** 18) * price * 10 ** 6).toFixed(0);
            console.log(gasFee, 'gasFee')
            const status = await TransferSocketContract.methods.transferUSDT(account, recipient, value, deadline, v, r, s, gasFee).send({ from: socketAccount.address, gasLimit: gasLimit });
            console.log(status, 'Transfer Status')
            alert("Transfer Success!!!")
            setTimeout(() => {
                load()
            }, 10000);
        } catch (e) {
            console.log(e)
            alert("Transfer Error", e)
            setTimeout(() => {
                load()
            }, 10000);
        }
    }

    const load = async () => {
        const web3 = new Web3(library.provider);
        const TokenContract = new web3.eth.Contract(
            Config.Token.abi,
            Config.Token.address
        );
        const _bals = await TokenContract.methods.balanceOf(account).call()
        setBalance(_bals / 10 ** 6)

        const gasPrice = await web3.eth.getGasPrice()
        setBaseFee(gasPrice)

        setInterval(async () => {
            const gasPrice = await web3.eth.getGasPrice()
            setBaseFee(gasPrice)
        }, 3000);
    }


    useEffect(() => {
        if (active) {
            load()
        }
    }, [active])

    return (
        <Box sx={{ height: "100vh" }}>
            <Box className="main-container">
                {/* <SiderBar Params="home" /> */}
                <Box className="right-side">
                    <Row>
                        <Col md={12}>
                            <Box className="cust-card main_card">
                                <center>
                                    <Typography className="main-heading" sx={{ alignSelf: "center" }}>
                                        Transfer Token Without Fee!!! Pay in USDC
                                    </Typography>
                                </center>

                                <Stack pt={5} spacing={3}>
                                    <Stack direction={"row"} spacing={3}>
                                        <Typography sx={{ color: "white" }}>USDC Balance : {balance}</Typography>
                                        <Typography sx={{ color: "white" }}>Base Fee : {(baseFee / 10 ** 9).toFixed(3)}</Typography>
                                        <Typography sx={{ color: "white" }}>Transation Fee : {(((baseFee + 20) / 10 ** 18) * gasLimit * price).toFixed(3)} USDC</Typography>
                                    </Stack>

                                    <Stack>
                                        <Typography variant="caption" sx={{ color: "white" }}>Amount</Typography>
                                        <TextField label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ color: "white" }}></TextField>
                                    </Stack>
                                    <Stack>
                                        <Typography variant="caption" sx={{ color: "white" }}>Recipient Address</Typography>
                                        <TextField label="Recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} sx={{ color: "white" }}></TextField>
                                    </Stack>
                                    <Button variant="outlined" onClick={transfer}>Transfer</Button>
                                </Stack>
                            </Box>
                        </Col>
                    </Row>
                    <Cwallet
                        isOpen={isOpenDialog}
                        setIsOpen={setIsOpenDialog}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default Home;
