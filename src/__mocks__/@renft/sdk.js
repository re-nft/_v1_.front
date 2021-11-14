/* eslint-disable unused-imports/no-unused-vars */
import { TransactionReceiptStatus } from "renft-front/types"
import { BigNumber } from '@ethersproject/bignumber';
const originalModule = jest.requireActual("@renft/sdk")


const blockNumber = 0;
const generateRandomHashLike = () => {
    return (Math.random() * 100000).toString();
}


export const createTransactionReceipt = (status) => ({
    to: "to address",
    from: "from address",
    contractAddress: "contract address",
    transactionIndex: 2,
    gasUsed: BigNumber.from(1),
    logsBloom: "",
    transactionHash: "transactionHash",
    logs: [],
    blockNumber: blockNumber + 1,
    confirmations: 1,
    cumulativeGasUsed: BigNumber.from(1),
    effectiveGasPrice: BigNumber.from(1),
    byzantium: false,
    type: 1,
    // For testing these two fields are interests to us
    blockHash: generateRandomHashLike(),
    // but mostly status
    // let's be pessimistic by default, test should fail
    status,
});

export const createContractTransaction = (status = TransactionReceiptStatus.FAILURE) => {
    return {
        wait: jest.fn().mockReturnValue(
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve(createTransactionReceipt(status))
                }, 10)
            })
        ),
        hash: "string",
        from: "from",
        confirmations: 1,
        nonce: 1,
        data: "",
        value: BigNumber.from(1),
        chainId: 1,
        gasLimit: BigNumber.from(10e8)
    }
}

// VERSION: sdk version 2.2.4
// collateral enabled: yes
const mod = {
    __esModule: true,
    ...originalModule,
    ReNFT: jest.fn().mockImplementation(() => {
        return {
            lend: (
                nftAddress,
                tokenID,
                amount,
                maxRentDuration,
                dailyRentPrice,
                nftPrice,
                paymentToken
            ) => {
                return Promise.resolve(createContractTransaction())
            },

            rent: (
                nftAddress,
                tokenID,
                lendingID,
                rentDuration
            ) => {
                return Promise.resolve(createContractTransaction())
            },

            returnIt: (
                nftAddress,
                tokenID,
                lendingID
            ) => {
                return Promise.resolve(createContractTransaction())
            },

            claimCollateral: (
                nftAddress,
                tokenID,
                lendingID
            ) => {
                return Promise.resolve(createContractTransaction())
            },

            stopLending: (
                nftAddress,
                tokenID,
                lendingID
            ) => {
                return Promise.resolve(createContractTransaction())

            }
        }
    })
}

module.exports = mod;
