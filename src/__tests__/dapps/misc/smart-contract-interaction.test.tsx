import { useStartLend } from "renft-front/hooks/contract/useStartLend";
import { useStopLend } from "renft-front/hooks/contract/useStopLend";
import { useClaimcollateral } from "renft-front/hooks/contract/useClaimCollateral";
import { useStartRent } from "renft-front/hooks/contract/useStartRent";
import { useReturnIt } from "renft-front/hooks/contract/useReturnIt";
import { TransactionStateEnum } from "renft-front/types";
import { Nft } from "renft-front/types/classes";
import { renderHook, act } from "@testing-library/react-hooks";
import * as sdk from "renft-front/hooks/contract/useSDK";
import { BigNumber } from "@ethersproject/bignumber";
import { PaymentToken } from "@renft/sdk";

// import reset function for mocks, which is ducktapped, only availaible for tests
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
  act(() => mockStoreResetFns.forEach((resetFn) => resetFn()));
});

jest.mock("renft-front/hooks/contract/useContractAddress");
jest.mock("renft-front/hooks/store/useSnackProvider");
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
              setTimeout(() => {
                resolve({ status: 1 });
              }, 100);
            })
        ),
      },
    }),
  };
});

describe("Smart contract interaction", () => {
  describe("lend", () => {
    let first: LendInputDefined;
    let second: LendInputDefined;
    let third: LendInputDefined;
    let last: LendInputDefined;
    beforeEach(() => {
      first = {
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
      second = {
        lendAmount: 1,
        maxDuration: 1,
        borrowPrice: 1,
        nftPrice: 1,
        tokenId: "2",
        isERC721: true,
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 1",
        nft: new Nft("contract address 1", "2", true),
      };
      third = {
        lendAmount: 2,
        maxDuration: 2,
        borrowPrice: 1.2,
        nftPrice: 1.3,
        isERC721: false,
        tokenId: "3",
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 2",
        nft: new Nft("contract address 2", "1", true),
      };
      last = {
        lendAmount: 2,
        maxDuration: 2,
        borrowPrice: 1.2,
        nftPrice: 1.3,
        isERC721: false,
        tokenId: "4",
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 2",
        nft: new Nft("contract address 2", "2", true),
      };
    });

    it("cannot lend empty items", async () => {
      const { result } = renderHook(useStartLend);

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.startLend([]);
      });

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );
    });

    it("lend owned item", async () => {
      // todo not working
      const { result, waitForValueToChange } = renderHook(useStartLend);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.startLend([first]);
      });
      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.SUCCESS);
    });

    it("start lend multiple items", async () => {
      const { result, waitForValueToChange } = renderHook(useStartLend);
      // Check everthing is default
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.startLend([first, second]);
      });

      await waitForValueToChange(() => result.current.status);

      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.SUCCESS);
    });
    it("start lend with gas optimization", async () => {
      const spy = jest.spyOn(sdk, "useSDK");
      const mockCall = jest.fn().mockReturnValue(Promise.resolve());
      spy.mockReturnValue({
        lend: mockCall,
      });

      //ACT
      const { result, waitForValueToChange } = renderHook(useStartLend);
      // Check everthing is default
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      act(() => {
        result.current.startLend([last, third, second, first]);
      });

      await waitForValueToChange(() => result.current.status);
      expect(mockCall).toHaveBeenCalledWith(
        [
          first.nftAddress,
          second.nftAddress,
          third.nftAddress,
          last.nftAddress,
        ],
        [
          BigNumber.from(first.tokenId),
          BigNumber.from(second.tokenId),
          BigNumber.from(third.tokenId),
          BigNumber.from(last.tokenId),
        ],
        [
          first.lendAmount,
          second.lendAmount,
          third.lendAmount,
          last.lendAmount,
        ],
        [
          first.maxDuration,
          second.maxDuration,
          third.maxDuration,
          last.maxDuration,
        ],
        [
          first.borrowPrice,
          second.borrowPrice,
          third.borrowPrice,
          last.borrowPrice,
        ],
        [first.nftPrice, second.nftPrice, third.nftPrice, last.nftPrice],
        [first.pmToken, second.pmToken, third.pmToken, last.pmToken]
      );
      spy.mockRestore();
    });
  });
  describe("stop lend", () => {
    let first: Lending;
    let second: Lending;
    let third: Lending;
    let last: Lending;
    beforeEach(() => {
      first = {
        id: 1,
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
      second = {
        id: 2,
        lendAmount: 1,
        maxDuration: 1,
        borrowPrice: 1,
        nftPrice: 1,
        tokenId: "2",
        isERC721: true,
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 1",
        nft: new Nft("contract address 1", "2", true),
      };
      third = {
        id: 3,
        lendAmount: 2,
        maxDuration: 2,
        borrowPrice: 1.2,
        nftPrice: 1.3,
        isERC721: false,
        tokenId: "3",
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 2",
        nft: new Nft("contract address 2", "1", true),
      };
      last = {
        id: 4,
        lendAmount: 2,
        maxDuration: 2,
        borrowPrice: 1.2,
        nftPrice: 1.3,
        isERC721: false,
        tokenId: "4",
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 2",
        nft: new Nft("contract address 2", "2", true),
      };
    });

    it("cannot stop lend empty items", async () => {
      const { result } = renderHook(useStopLend);

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.stopLend([]);
      });

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );
    });

    it("stop lend owned item", async () => {
      const { result, waitForValueToChange } = renderHook(useStopLend);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.stopLend([first]);
      });
      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.SUCCESS);
    });

    it("stop lend multiple items", async () => {
      const { result, waitForValueToChange } = renderHook(useStopLend);
      // Check everthing is default
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.stopLend([first, second, third, last]);
      });

      await waitForValueToChange(() => result.current.status);

      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.SUCCESS);
    });

    it("stop lend with gas optimization", async () => {
      const spy = jest.spyOn(sdk, "useSDK");
      const mockCall = jest.fn().mockReturnValue(Promise.resolve());
      spy.mockReturnValue({
        stopLending: mockCall,
      });

      //ACT
      const { result, waitForValueToChange } = renderHook(useStopLend);
      // Check everthing is default
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      act(() => {
        result.current.stopLend([last, third, second, first]);
      });

      await waitForValueToChange(() => result.current.status);
      expect(mockCall).toHaveBeenCalledWith(
        [
          first.nftAddress,
          second.nftAddress,
          third.nftAddress,
          last.nftAddress,
        ],
        [
          BigNumber.from(first.tokenId),
          BigNumber.from(second.tokenId),
          BigNumber.from(third.tokenId),
          BigNumber.from(last.tokenId),
        ],
        [
          BigNumber.from(first.id),
          BigNumber.from(second.id),
          BigNumber.from(third.id),
          BigNumber.from(last.id),
        ]
      );
      spy.mockRestore();
    });
  });
  describe("claim", () => {
    let first: Lending;
    let second: Lending;
    let third: Lending;
    let last: Lending;
    beforeEach(() => {
      first = {
        id: 1,
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
      second = {
        id: 2,
        lendAmount: 1,
        maxDuration: 1,
        borrowPrice: 1,
        nftPrice: 1,
        tokenId: "2",
        isERC721: true,
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 1",
        nft: new Nft("contract address 1", "2", true),
      };
      third = {
        id: 3,
        lendAmount: 2,
        maxDuration: 2,
        borrowPrice: 1.2,
        nftPrice: 1.3,
        isERC721: false,
        tokenId: "3",
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 2",
        nft: new Nft("contract address 2", "1", true),
      };
      last = {
        id: 4,
        lendAmount: 2,
        maxDuration: 2,
        borrowPrice: 1.2,
        nftPrice: 1.3,
        isERC721: false,
        tokenId: "4",
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 2",
        nft: new Nft("contract address 2", "2", true),
      };
    });

    it("cannot claim empty items", async () => {
      const { result } = renderHook(useClaimcollateral);

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.claim([]);
      });

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );
    });

    it("claim one item", async () => {
      const { result, waitForValueToChange } = renderHook(useClaimcollateral);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.claim([first]);
      });
      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.SUCCESS);
    });

    it("claim multiple items", async () => {
      const { result, waitForValueToChange } = renderHook(useClaimcollateral);
      // Check everthing is default
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.claim([first, second, third, last]);
      });

      await waitForValueToChange(() => result.current.status);

      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.SUCCESS);
    });
    it("claim with gas optimization", async () => {
      const spy = jest.spyOn(sdk, "useSDK");
      const mockCall = jest.fn().mockReturnValue(Promise.resolve());
      spy.mockReturnValue({
        claimCollateral: mockCall,
      });

      //ACT
      const { result, waitForValueToChange } = renderHook(useClaimcollateral);
      // Check everthing is default
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      act(() => {
        result.current.claim([last, third, second, first]);
      });

      await waitForValueToChange(() => result.current.status);
      expect(mockCall).toHaveBeenCalledWith(
        [
          first.nftAddress,
          second.nftAddress,
          third.nftAddress,
          last.nftAddress,
        ],
        [
          BigNumber.from(first.tokenId),
          BigNumber.from(second.tokenId),
          BigNumber.from(third.tokenId),
          BigNumber.from(last.tokenId),
        ],
        [
          BigNumber.from(first.id),
          BigNumber.from(second.id),
          BigNumber.from(third.id),
          BigNumber.from(last.id),
        ]
      );
      spy.mockRestore();
    });
  });
  describe("rent", () => {
    let first: Lending;
    let second: Lending;
    let third: Lending;
    let last: Lending;
    beforeEach(() => {
      first = {
        id: 1,
        lendingId: "1",
        rentDuration: 1,
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
      second = {
        id: 2,
        rentDuration: 1,
        lendingId: "2",
        lendAmount: 1,
        maxDuration: 1,
        borrowPrice: 1,
        nftPrice: 1,
        tokenId: "2",
        isERC721: true,
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 1",
        nft: new Nft("contract address 1", "2", true),
      };
      third = {
        id: 3,
        lendingId: "3",
        rentDuration: 1,
        lendAmount: 2,
        maxDuration: 2,
        borrowPrice: 1.2,
        nftPrice: 1.3,
        isERC721: false,
        tokenId: "3",
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 2",
        nft: new Nft("contract address 2", "1", true),
      };
      last = {
        id: 4,
        lendingId: "4",
        rentDuration: 1,
        lendAmount: 2,
        maxDuration: 2,
        borrowPrice: 1.2,
        nftPrice: 1.3,
        isERC721: false,
        tokenId: "4",
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 2",
        nft: new Nft("contract address 2", "2", true),
      };
    });

    it("cannot rent empty items", async () => {
      const { result } = renderHook(useStartRent);

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.startRent([]);
      });

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );
    });

    it("rent one item", async () => {
      const { result, waitForValueToChange } = renderHook(useStartRent);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.startRent([first]);
      });
      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.SUCCESS);
    });
    it("rent multiple items", async () => {
      const { result, waitForValueToChange } = renderHook(useStartRent);
      // Check everthing is default
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.startRent([first, second, third, last]);
      });

      await waitForValueToChange(() => result.current.status);

      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.SUCCESS);
    });

    it("rent with gas optimization", async () => {
      const spy = jest.spyOn(sdk, "useSDK");
      const mockCall = jest.fn().mockReturnValue(Promise.resolve());
      spy.mockReturnValue({
        rent: mockCall,
      });

      //ACT
      const { result, waitForValueToChange } = renderHook(useStartRent);
      // Check everthing is default
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      act(() => {
        result.current.startRent([last, third, second, first]);
      });

      await waitForValueToChange(() => result.current.status);
      expect(mockCall).toHaveBeenCalledWith(
        [
          first.nftAddress,
          second.nftAddress,
          third.nftAddress,
          last.nftAddress,
        ],
        [
          BigNumber.from(first.tokenId),
          BigNumber.from(second.tokenId),
          BigNumber.from(third.tokenId),
          BigNumber.from(last.tokenId),
        ],
        [
          BigNumber.from(first.lendingId),
          BigNumber.from(second.lendingId),
          BigNumber.from(third.lendingId),
          BigNumber.from(last.lendingId),
        ],
        [
          Number(first.rentDuration),
          Number(second.rentDuration),
          Number(third.rentDuration),
          Number(last.rentDuration),
        ]
      );
      spy.mockRestore();
    });
  });

  describe("return", () => {
    let first: Renting;
    let second: Renting;
    let third: Renting;
    let last: Renting;
    beforeEach(() => {
      first = {
        id: 1,
        lendingId: "1",
        rentDuration: 1,
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
      second = {
        id: 2,
        rentDuration: 1,
        lendingId: "2",
        lendAmount: 1,
        maxDuration: 1,
        borrowPrice: 1,
        nftPrice: 1,
        tokenId: "2",
        isERC721: true,
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 1",
        nft: new Nft("contract address 1", "2", true),
      };
      third = {
        id: 3,
        lendingId: "3",
        rentDuration: 1,
        lendAmount: 2,
        maxDuration: 2,
        borrowPrice: 1.2,
        nftPrice: 1.3,
        isERC721: false,
        tokenId: "3",
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 2",
        nft: new Nft("contract address 2", "1", true),
      };
      last = {
        id: 4,
        lendingId: "4",
        rentDuration: 1,
        lendAmount: 2,
        maxDuration: 2,
        borrowPrice: 1.2,
        nftPrice: 1.3,
        isERC721: false,
        tokenId: "4",
        pmToken: PaymentToken.WETH,
        nftAddress: "contract address 2",
        nft: new Nft("contract address 2", "2", true),
      };
    });

    it("cannot return empty items", async () => {
      const { result } = renderHook(useReturnIt);

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.returnIt([]);
      });

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );
    });

    it("return one item", async () => {
      const { result, waitForValueToChange } = renderHook(useReturnIt);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.returnIt([first]);
      });
      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.SUCCESS);
    });
    it("return multiple items", async () => {
      const { result, waitForValueToChange } = renderHook(useReturnIt);
      // Check everthing is default
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      //ACT
      act(() => {
        result.current.returnIt([first, second, third, last]);
      });

      await waitForValueToChange(() => result.current.status);

      expect(result.current.status.isLoading).toBe(true);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.PENDING);

      await waitForValueToChange(() => result.current.status);

      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(TransactionStateEnum.SUCCESS);
    });

    it("rent with gas optimization", async () => {
      const spy = jest.spyOn(sdk, "useSDK");
      const mockCall = jest.fn().mockReturnValue(Promise.resolve());
      spy.mockReturnValue({
        returnIt: mockCall,
      });

      //ACT
      const { result, waitForValueToChange } = renderHook(useReturnIt);
      // Check everthing is default
      expect(result.current.status.isLoading).toBe(false);
      expect(result.current.status.hasFailure).toBe(false);
      expect(result.current.status.status).toBe(
        TransactionStateEnum.NOT_STARTED
      );

      act(() => {
        result.current.returnIt([last, third, second, first]);
      });

      await waitForValueToChange(() => result.current.status);
      expect(mockCall).toHaveBeenCalledWith(
        [
          first.nftAddress,
          second.nftAddress,
          third.nftAddress,
          last.nftAddress,
        ],
        [
          BigNumber.from(first.tokenId),
          BigNumber.from(second.tokenId),
          BigNumber.from(third.tokenId),
          BigNumber.from(last.tokenId),
        ],
        [
          BigNumber.from(first.lendingId),
          BigNumber.from(second.lendingId),
          BigNumber.from(third.lendingId),
          BigNumber.from(last.lendingId),
        ]
      );
      spy.mockRestore();
    });
  });
});
