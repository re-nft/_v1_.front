import React from "react";
import {
  render,
  screen,
  waitFor,
  within,
  act,
  prettyDOM,
} from "@testing-library/react";
import user from "@testing-library/user-event";
import { SetupServerApi } from "msw/node";
import * as testAssets from "./assets.json";
//import { PAGE_SIZE } from "renft-front/consts";
import * as Sentry from "@sentry/nextjs";
import { getContractWithProvider } from "renft-front/utils";
import { waitForRefetch, mockResponse } from "./test-utils";

jest.mock("renft-front/hooks/store/useSnackProvider");
jest.mock("renft-front/hooks/store/useWallet", () => {
  return {
    useWallet: jest.fn(() => ({
      network: "mainnet",
      signer: "dummy signer",
      address: "dummy address",
    })),
  };
});
jest.mock("renft-front/utils", () => {
  const actualModule = jest.requireActual("renft-front/utils");
  return {
    __esModule: true,
    ...actualModule,
    getContractWithProvider: jest.fn().mockReturnValue({
      balanceOf: jest.fn().mockReturnValue(Promise.resolve(2)),
    }),
    getContractWithSigner: jest.fn().mockResolvedValue({
      isApprovedForAll: jest.fn().mockResolvedValue(true),
    }),
  };
});
jest.mock("renft-front/consts", () => {
  const actualModule = jest.requireActual("renft-front/consts");
  return {
    __esModule: true,
    ...actualModule,
    ERC1155_REFETCH_INTERVAL: 5000,
  };
});

import LendPage from "renft-front/pages/lend";

const intervalServerError = { message: "Interval Server error" };

beforeAll(() => {
  Object.defineProperty(global.window, "IntersectionObserver", {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })),
  });
});

const EIP1155_response = {
  data: {
    account: {
      balances: [
        {
          token: {
            registry: {
              contractAddress: "eip1155address",
            },
            tokenURI: "https://dummy-eip1155",
            tokenId: "eip1155tokenid",
          },
        },
      ],
    },
  },
};

const EIP721_response = {
  data: {
    tokens: [
      {
        id: "eip721address_eip721tokenid",
        tokenURI: "https://dummy-eip721",
        tokenId: "eip721tokenid",
        contractAddress: "eip721address",
      },
    ],
  },
};

describe("lend page wallet connected", () => {
  // Enable API mocking before tests.
  let mswServer: SetupServerApi;
  beforeAll(async () => {
    // use dynamic require to properly mock process.env
    await import("__mocks__/server").then(({ server }) => {
      mswServer = server;
      return mswServer.listen();
    });
  });

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => {
    if (mswServer) mswServer.resetHandlers();
  });

  // Disable API mocking after the tests are done.
  afterAll(() => mswServer && mswServer.close());

  it("renders empty content when EIP_1155 server errors", async () => {
    mswServer.use(
      ...mockResponse({
        eip1155response: {
          status: 500,
          json: intervalServerError,
        },
      })
    );
    await act(async () => {
      render(<LendPage />);
    });

    await waitForRefetch(screen);

    await waitFor(() => {
      const message = screen.getByText(/you don't have any nfts to lend/i);

      expect(message).toBeInTheDocument();
    });
  }, 2000);

  it("should log to sentry when EIP_721 errors", async () => {
    mswServer.use(
      ...mockResponse({
        eip721api: {
          status: 500,
          json: intervalServerError,
        },
      })
    );

    await act(async () => {
      render(<LendPage />);
    });

    await waitForRefetch(screen);

    await waitFor(() => {
      // TODO:eniko decrease the amount
      expect(Sentry.captureException).toHaveBeenCalledTimes(20);
    });
  });
  it("should show EIP721 response", async () => {
    mswServer.use(
      ...mockResponse({
        eip721api: {
          status: 200,
          json: EIP721_response,
        },
      })
    );

    act(() => {
      render(<LendPage />);
    });

    await waitForRefetch(screen);
    await waitFor(() => {
      const items = screen.getAllByTestId("catalogue-item-loaded");

      expect(items.length).toBe(1);
    });
  });

  it("should show EIP1155 response", async () => {
    mswServer.use(
      ...mockResponse({
        eip1155api: {
          status: 200,
          json: EIP1155_response,
        },
      })
    );

    act(() => {
      render(<LendPage />);
    });

    await waitForRefetch(screen);
    await waitFor(() => {
      const items = screen.getAllByTestId("catalogue-item-loaded");

      expect(items.length).toBe(1);
    });
  });

  it("should show two items", async () => {
    mswServer.use(
      ...mockResponse({
        eip1155api: {
          status: 200,
          json: EIP1155_response,
        },
        eip721api: {
          status: 200,
          json: EIP721_response,
        },
      })
    );

    act(() => {
      render(<LendPage />);
    });

    await waitForRefetch(screen);
    await waitFor(() => {
      const items = screen.getAllByTestId("catalogue-item-loaded");

      expect(items.length).toBe(2);
    });
  });

  //TODO:eniko ask design for this
  xit("renders refresh button when amount is not loaded", () => {
    expect(true).toBe(true);
  });
  // TODO assert amount, address, erc721 instead of snapshot

  describe("lend form open", () => {
    it("show lend form when 1 item selected with item details", async () => {
      mswServer.use(
        ...mockResponse({
          eip1155api: {
            status: 200,
            json: EIP1155_response,
          },
          eip721api: {
            status: 200,
            json: EIP721_response,
          },
        })
      );

      await act(async () => {
        render(<LendPage />);
      });
      await waitForRefetch(screen);
      await act(async () => {
        render(<LendPage />);
      });
      await waitFor(() => {
        screen.getAllByTestId("catalogue-item-loaded");
      });
      const grid = screen.getByRole("grid", {
        name: /nfts/i,
      });

      const { getAllByRole } = within(grid);
      const items = getAllByRole("gridcell", {
        selected: false,
      });
      expect(items.length).toBe(2);
      const firstItem = within(items[0]);
      const checkbox = firstItem.getByRole("checkbox");
      await act(async () => {
        user.click(checkbox);
      });

      const button = firstItem.getByRole("button", {
        name: /lend/i,
      });
      await act(async () => {
        user.click(button);
      });

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      const list = screen.getByRole("listitem");
      expect(list).toBeInTheDocument();
    });

    it("show lend form when 2 item selected with selected items details", async () => {
      mswServer.use(
        ...mockResponse({
          eip1155api: {
            status: 200,
            json: EIP1155_response,
          },
          eip721api: {
            status: 200,
            json: EIP721_response,
          },
        })
      );

      await act(async () => {
        render(<LendPage />);
      });
      await waitForRefetch(screen);
      await waitFor(() => {
        const items = screen.getAllByTestId("catalogue-item-loaded");
        expect(items.length).toBe(2);
      });
      const grid = screen.getByRole("grid", {
        name: /nfts/i,
      });

      const { getAllByRole } = within(grid);
      const items = getAllByRole("gridcell", {
        selected: false,
      });
      expect(items.length).toBe(2);
      const firstItem = within(items[0]);
      await act(async () => {
        user.click(firstItem.getByRole("checkbox"));
      });
      expect(firstItem.getByRole("checkbox")).toBeEnabled();

      const secondItem = within(items[1]);
      await act(async () => {
        user.click(secondItem.getByRole("checkbox"));
      });

      expect(secondItem.getByRole("checkbox")).toBeEnabled();
      const button = secondItem.getByRole("button", {
        name: /lend/i,
      });
      await act(async () => {
        user.click(button);
      });
      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
      const list = screen.getAllByRole("listitem");
      expect(list.length).toBe(2);
    });

    it("bug with item selection", async () => {
      mswServer.use(
        ...mockResponse({
          eip1155api: {
            status: 200,
            json: EIP1155_response,
          },
          eip721api: {
            status: 200,
            json: EIP721_response,
          },
        })
      );
      let rerender;
      await act(async () => {
        const view = render(<LendPage />);
        rerender = view.rerender;
      });
      await waitForRefetch(screen);
      await waitFor(() => {
        screen.getAllByTestId("catalogue-item-loaded");
      });
      const grid = screen.getByRole("grid", {
        name: /nfts/i,
      });

      const { getAllByRole } = within(grid);
      const items = getAllByRole("gridcell", {
        selected: false,
      });
      expect(items.length).toBe(2);
      const firstItem = within(items[0]);
      await act(async () => {
        user.click(firstItem.getByRole("checkbox"));
      });
      const secondItem = within(items[1]);
      await act(async () => {
        user.click(secondItem.getByRole("checkbox"));
      });

      const button = firstItem.getByRole("button", {
        name: /lend/i,
      });
      await act(async () => {
        user.click(button);
      });

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      const list = screen.getAllByRole("listitem");
      expect(list.length).toBe(2);
      //close modal
      await act(async () => {
        user.click(screen.getByText(/close/i));
      });
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });

      act(() => {
        mswServer.resetHandlers();
        mswServer.use(
          mockResponse({
            eip1155response: {
              status: 200,
              json: {},
            },
            eip721response: {
              status: 200,
              json: EIP721_response,
            },
          })
        );
      });
      await act(async () => {
        rerender(<LendPage />);
      });
      // need to wait for the API to hit again
      await waitFor(
        () => {
          // Only one item
          expect(
            screen.queryAllByRole("button", {
              name: /lend/i,
            }).length
          ).toBe(1);
        },
        { timeout: 10000 }
      );
      await act(async () => {
        user.click(
          screen.getByRole("button", {
            name: /lend/i,
          })
        );
      });

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      // the bug is still present
      //  console.log(prettyDOM(dialog));
      const list2 = within(dialog).getAllByRole("listitem");
      // should only render 1 item
      expect(list2.length).toBe(1);
    }, 15000);
  });

  describe("filter", () => {
    it("show collection filter if there are collections", async () => {
      testAssets.assets[0].tokenId = EIP721_response.data.tokens[0].tokenId;
      testAssets.assets[0].asset_contract.address =
        EIP721_response.data.tokens[0].contractAddress;
      testAssets.assets[1].tokenId =
        EIP1155_response.data.account.balances[0].token.tokenId;
      testAssets.assets[1].asset_contract.address =
        EIP1155_response.data.account.balances[0].token.registry.contractAddress;
      mswServer.use(
        ...mockResponse({
          eip1155api: {
            status: 200,
            json: EIP1155_response,
          },
          eip721api: {
            status: 200,
            json: EIP721_response,
          },
          openseaapi: {
            status: 200,
            json: testAssets,
          },
        })
      );

      await act(async () => {
        render(<LendPage />);
      });

      await waitForRefetch(screen);
      await waitFor(() => {
        screen.getAllByTestId("catalogue-item-loaded");
      });

      await waitFor(
        () => {
          const message = screen.getByLabelText(/Filter/i);

          expect(message).toBeInTheDocument();
        },
        { waitFor: 9000 }
      );
    }, 10000);
    it("should not show collection filter if there no collections", async () => {
      mswServer.use(
        ...mockResponse({
          eip1155api: {
            status: 200,
            json: EIP1155_response,
          },
          eip721api: {
            status: 200,
            json: EIP721_response,
          },
        })
      );

      await act(async () => {
        render(<LendPage />);
      });
      await waitForRefetch(screen);
      await waitFor(() => {
        const message = screen.queryByLabelText(/Filter/i);

        expect(message).not.toBeInTheDocument();
      });
    });
    it("not show sort on lend page", async () => {
      mswServer.use(
        ...mockResponse({
          eip1155api: {
            status: 200,
            json: EIP1155_response,
          },
          eip721api: {
            status: 200,
            json: EIP721_response,
          },
        })
      );

      await act(async () => {
        render(<LendPage />);
      });
      await waitForRefetch(screen);
      await waitFor(() => {
        const message = screen.queryByLabelText(/Sort/i);

        expect(message).toBeInTheDocument();
      });
    });
  });
  //TODO:eniko less important cases
  xdescribe("filter + paging works together (multiple case)", () => {});
  xdescribe("paging", () => {
    it("show items based on page number based on initial sort", () => {});
    it("items are not duplicated between pages", () => {});
    it("prev page works as intended", () => {});
    it("next page works as intended", () => {});
    it("page jump works as intended", () => {});
  });
});
