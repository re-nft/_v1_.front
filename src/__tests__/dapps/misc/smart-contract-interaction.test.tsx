import { useStartLend } from "renft-front/hooks/contract/useStartLend"
import { TransactionStateEnum } from "renft-front/types"
import { Nft } from "renft-front/types/classes"
import { renderHook, act } from "@testing-library/react-hooks"

jest.mock('firebase/app');
jest.mock("react-ga")
jest.mock("@renft/sdk")

jest.mock("@ethersproject/providers");
jest.mock('web3modal')

jest.mock("renft-front/hooks/contract/useContractAddress", () => {
    return {
        useContractAddress: jest.fn().mockReturnValue("dummy contract address")
    };

})
jest.mock('renft-front/hooks/store/useSnackProvider', () => {
    const originalModule = jest.requireActual("renft-front/hooks/store/useSnackProvider")
    return {
        __esModule: true,
        ...originalModule,
        useSnackProvider: jest.fn().mockReturnValue({
            setError: jest.fn()
        })
    }
})
import { PaymentToken } from "@renft/sdk"

describe("Smart contract interaction", () => {

    describe("lend", () => {

        xit('cannot return empty items', async () => {
            const { result } = renderHook(useStartLend);

            expect(result.current.status.isLoading).toBe(false)
            expect(result.current.status.hasFailure).toBe(false)
            expect(result.current.status.status).toBe(TransactionStateEnum.NOT_STARTED)

            //ACT
            act(() => {
                result.current.startLend([]);
            })


            expect(result.current.status.isLoading).toBe(false)
            expect(result.current.status.hasFailure).toBe(false)
            expect(result.current.status.status).toBe(TransactionStateEnum.NOT_STARTED)

        })

        describe("able to", () => {
            beforeEach(() => {
                jest.resetModules()
            })

            it('lend owned item', async () => {
                // todo not working
                jest.doMock("renft-front/hooks/store/useWallet", () => {
                    return {
                        useWallet: jest.fn().mockReturnValue({
                            signer: "dummy signer",
                            web3Provider: {
                                waitForTransaction: jest.fn().mockReturnValue(Promise.resolve({
                                    status: 0
                                }))
                            }
                        })
                    };

                })

                const { result, waitForNextUpdate } = renderHook(useStartLend);
                expect(result.current.status.isLoading).toBe(false)
                expect(result.current.status.hasFailure).toBe(false)
                expect(result.current.status.status).toBe(TransactionStateEnum.NOT_STARTED)

                //ACT
                act(() => {

                    result.current.startLend([{
                        lendAmount: 1,
                        maxDuration: 1,
                        borrowPrice: 1,
                        nftPrice: 1,
                        tokenId: "1",
                        pmToken: PaymentToken.WETH,
                        nftAddress: "contract address",
                        nft: new Nft("contract address", "1", true)
                    }])

                })
                await waitForNextUpdate()
                expect(result.current.status.isLoading).toBe(true)
                expect(result.current.status.hasFailure).toBe(false)
                expect(result.current.status.status).toBe(TransactionStateEnum.PENDING)

                await waitForNextUpdate()
                expect(result.current.status.isLoading).toBe(false)
                expect(result.current.status.hasFailure).toBe(false)
                expect(result.current.status.status).toBe(TransactionStateEnum.SUCCESS)
            })

            xit('rent multiple items', async () => {

                const { result, waitForNextUpdate } = renderHook(useStartLend);
                // Check everthing is default
                expect(result.current.status.isLoading).toBe(false)
                expect(result.current.status.hasFailure).toBe(false)
                expect(result.current.status.status).toBe(TransactionStateEnum.NOT_STARTED)

                //ACT
                act(() => {
                    result.current.startLend([{
                        lendAmount: 1,
                        maxDuration: 1,
                        borrowPrice: 1,
                        nftPrice: 1,
                        tokenId: "1",
                        pmToken: PaymentToken.WETH,
                        nftAddress: "contract address",
                        nft: new Nft("contract address", "1", true)
                    }, {
                        lendAmount: 2,
                        maxDuration: 2,
                        borrowPrice: 1.2,
                        nftPrice: 1.3,
                        tokenId: "2",
                        pmToken: PaymentToken.WETH,
                        nftAddress: "contract address",
                        nft: new Nft("contract address", "2", true)

                    }])
                })

                await waitForNextUpdate();

                expect(result.current.status.isLoading).toBe(true)
                expect(result.current.status.hasFailure).toBe(false)
                expect(result.current.status.status).toBe(TransactionStateEnum.PENDING)

                await waitForNextUpdate();

                expect(result.current.status.isLoading).toBe(false)
                expect(result.current.status.hasFailure).toBe(false)
                expect(result.current.status.status).toBe(TransactionStateEnum.SUCCESS)

            })


        })

    })
    xdescribe("stop lend", () => {
        it('able to stop lend items which has no renter', () => {
            expect(true).toBe(false)
        })
        it('error scenario with nfts with renter', () => {
            expect(true).toBe(false)
        })
        it('error scenario when Nfts rental expired', () => {
            expect(true).toBe(false)
        })
        it('gas optimized parameters are passed in', () => {
            expect(true).toBe(false)
        })

    })
    xdescribe("claim", () => {
        it('able to claim items that expired', () => {
            expect(true).toBe(false)
        })
        it('not able to claim items which are not expired', () => {
            expect(true).toBe(false)
        })
        it('gas optimized parameters are passed in', () => {
            expect(true).toBe(false)
        })
    })
    xdescribe("rent", () => {
        it('able to rent items when tokens are approved', () => {
            expect(true).toBe(false)
        })
        it('error message when tokens are not approved for spending', () => {
            expect(true).toBe(false)
        })
        it('gas optimized parameters are passed in', () => {
            expect(true).toBe(false)
        })
        it('able to rent relent items', () => {
            expect(true).toBe(false)
        })

    })
    xdescribe("return", () => {
        it('able to rent items when NFTs are approved', () => {
            expect(true).toBe(false)
        })
        it('error message when tokens are not approved for spending', () => {
            expect(true).toBe(false)
        })
        it('gas optimized parameters are passed in', () => {
            expect(true).toBe(false)
        })
        it('not able to return after rental period being expired', () => {
            expect(true).toBe(false)
        })
    })

})
