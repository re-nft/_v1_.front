import { useStartLend } from "renft-front/hooks/contract/useStartLend";
import { useStopLend } from "renft-front/hooks/contract/useStopLend";
import { useClaimcollateral } from "renft-front/hooks/contract/useClaimCollateral";
import { useStartRent } from "renft-front/hooks/contract/useStartRent";
import { useReturnIt } from "renft-front/hooks/contract/useReturnIt";
import { useNFTApproval } from "renft-front/hooks/contract/useNFTApproval";
import { TransactionStateEnum } from "renft-front/types";
import { Nft } from "renft-front/types/classes";
import { renderHook, act } from "@testing-library/react-hooks";
import { PaymentToken } from "@renft/sdk";

import { getContractWithSigner } from "renft-front/utils";
jest.mock("renft-front/hooks/contract/useContractAddress");
jest.mock("renft-front/hooks/misc/useCurrentAddress");
jest.mock("renft-front/hooks/store/useSnackProvider");

jest.mock("renft-front/utils", () => {
  const originalModule = jest.requireActual("renft-front/utils");
  return {
    __esModule: true,
    ...originalModule,
    getContractWithSigner: jest.fn(() => {
      return Promise.resolve({
        setApprovalForAll: jest.fn(() => Promise.resolve()),
        isApprovedForAll: jest.fn(() => {
          return Promise.resolve(true);
        }),
      });
    }),
  };
});

// THIS IS annoying, need to use file level mocking for all tests all succcess, all failure mocking, not per test level
// doMock is not working with typescript, need to investigate a better solution
jest.mock("renft-front/hooks/store/useWallet", () => {
  return {
    __esModule: true,
    useWallet: jest.fn().mockReturnValue({
      signer: "dummy signer",
      web3Provider: {
        waitForTransaction: jest.fn(
          () =>
            new Promise((resolve) => {
              setTimeout(() => resolve({ status: 0 }), 100);
            })
        ),
      },
    }),
  };
});
//import reset function for mocks, which is ducktapped, only availaible for tests
import { mockStoreResetFns } from "zustand";
jest.mock("zustand", () => {
  const mockStoreResetFns = new Set();
  return {
    __esModule: true,
    default: jest.fn().mockImplementation((createState: any) => {
      const actualCreate = jest.requireActual("zustand").default;
      const store = actualCreate(createState);
      const initialState = store.getState();
      mockStoreResetFns.add(() => store.setState({ ...initialState }, true));
      return store;
    }),
    mockStoreResetFns,
  };
});

afterEach(() => {
  act(() => {
    try {
      mockStoreResetFns.forEach((resetFn) => {
        if (resetFn && typeof resetFn === "function") resetFn();
      });
    } catch (e) {
      // do nothing
    }
  });
});

describe("Failure scenarios smart contract returning error", () => {
  describe("lend", () => {
    it("error message from contract propagates", async () => {
      const nft = {
        lendAmount: 1,
        maxDuration: 1,
        borrowPrice: 1,
        nftPrice: 1,
        tokenId: "1",
        isERC721: true,
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 1",
        nft: new Nft("contract address 1", "1", true),
      };
      // todo not working
      const { result, waitForValueToChange } = renderHook(() => useStartLend());
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT;
      act(() => {
        result.current.startLend([nft]);
      });
      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(true);
      expect(result.current.status.status).toBe(TransactionStateEnum.FAILED);
    });
  });
  describe("stop lend", () => {
    it("error message from contract propagates", async () => {
      const stopLend = {
        lendAmount: 1,
        id: "1",
        maxDuration: 1,
        borrowPrice: 1,
        nftPrice: 1,
        tokenId: "1",
        isERC721: true,
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 1",
        nft: new Nft("contract address 1", "1", true),
      };
      const { result, waitForValueToChange } = renderHook(useStopLend);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.stopLend([stopLend]);
      });

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(true);
      expect(result.current.status.status).toBe(TransactionStateEnum.FAILED);
    });
  });

  describe("claim", () => {
    it("error message from contract propagates", async () => {
      const lending = {
        lendAmount: 1,
        id: "1",
        maxDuration: 1,
        borrowPrice: 1,
        nftPrice: 1,
        tokenId: "1",
        isERC721: true,
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 1",
        nft: new Nft("contract address 1", "1", true),
      };
      const { result, waitForValueToChange } = renderHook(useClaimcollateral);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //act
      act(() => {
        result.current.claim([lending]);
      });

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(true);
      expect(result.current.status.status).toBe(TransactionStateEnum.FAILED);
    });
  });

  describe("rent", () => {
    it("error message from contract propagates", async () => {
      const lending = {
        lendAmount: 1,
        lendingId: "1",
        maxDuration: 1,
        borrowPrice: 1,
        nftPrice: 1,
        tokenId: "1",
        isERC721: true,
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 1",
        nft: new Nft("contract address 1", "1", true),
      };
      const { result, waitForValueToChange } = renderHook(useStartRent);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.startRent([lending]);
      });

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(true);
      expect(result.current.status.status).toBe(TransactionStateEnum.FAILED);
    });
  });

  describe("return", () => {
    it("error message from contract propagates", async () => {
      const lending = {
        lendAmount: 1,
        id: "1",
        lendingId: "1",
        rentDuration: 1,
        maxDuration: 1,
        borrowPrice: 1,
        nftPrice: 1,
        tokenId: "1",
        isERC721: true,
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 1",
        nft: new Nft("contract address 1", "1", true),
      };
      const { result, waitForValueToChange } = renderHook(useReturnIt);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.returnIt([lending]);
      });

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(true);
      expect(result.current.status.status).toBe(TransactionStateEnum.FAILED);
    });
  });
  describe("approve nfts", () => {
    it("error message from contract propagates", async () => {
      getContractWithSigner.mockImplementation(() => {
        return Promise.resolve({
          setApprovalForAll: jest.fn(() => {
            return new Promise((resolve) => {
              setTimeout(
                () =>
                  resolve({
                    hash: "some hash",
                  }),
                1000
              );
            });
          }),
          isApprovedForAll: jest.fn(() => {
            return Promise.resolve(false);
          }),
        });
      });

      const lending = {
        lendAmount: 1,
        id: "1",
        lendingId: "1",
        rentDuration: 1,
        maxDuration: 1,
        borrowPrice: 1,
        nftPrice: 1,
        tokenId: "1",
        isERC721: true,
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 1",
        nft: new Nft("contract address 1", "1", true),
      };
      const { result, waitForValueToChange } = renderHook(() =>
        useNFTApproval([lending])
      );
      expect(result.current.approvalStatus.isLoading).toBe(false);
      expect(result.current.approvalStatus.hasFailure).toBe(false);
      expect(result.current.approvalStatus.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      await waitForValueToChange(() => result.current.nonApprovedNft);
      //ACT
      act(() => {
        result.current.handleApproveAll();
      });
      await waitForValueToChange(() => result.current.approvalStatus, {
        timeout: 2000,
      });
      expect(result.current.approvalStatus.isLoading).toBe(true);
      expect(result.current.approvalStatus.hasFailure).toBe(false);
      expect(result.current.approvalStatus.status).toBe(
        TransactionStateEnum.PENDING
      );

      await waitForValueToChange(() => result.current.approvalStatus, {
        timeout: 2000,
      });
      expect(result.current.approvalStatus.isLoading).toBe(false);
      expect(result.current.approvalStatus.hasFailure).toBe(true);
      expect(result.current.approvalStatus.status).toBe(
        TransactionStateEnum.FAILED
      );
    });
  });
  describe("approve tokens", () => {
    it("error message from contract propagates", async () => {
      const lending = {
        lendAmount: 1,
        id: "1",
        lendingId: "1",
        rentDuration: 1,
        maxDuration: 1,
        borrowPrice: 1,
        nftPrice: 1,
        tokenId: "1",
        isERC721: true,
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 1",
        nft: new Nft("contract address 1", "1", true),
      };
      const { result, waitForValueToChange } = renderHook(useReturnIt);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.returnIt([lending]);
      });

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(true);
      expect(result.current.status.status).toBe(TransactionStateEnum.FAILED);
    });
  });
});
