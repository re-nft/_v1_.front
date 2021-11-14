const network = 'mainnet';
const address = "889714669dB168bBdB3894929de608e57959FEFc"
const originalModule = jest.requireActual("@ethersproject/providers")
const signer = {
    getAddress: jest.fn().mockReturnValue(Promise.resolve(address))
};
module.exports = {
    __esModule: true,
    ...originalModule,
        Web3Provider: jest.fn().mockImplementation(() => ({
            getNetwork: jest.fn().mockReturnValue(Promise.resolve({name: network})),
            getSigner: jest.fn().mockReturnValue(signer)
        }))
}