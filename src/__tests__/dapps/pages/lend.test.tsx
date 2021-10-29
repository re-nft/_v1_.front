import React from "react";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
  act,
} from "@testing-library/react";
import user from "@testing-library/user-event";
import { SetupServerApi } from "msw/node";
import { rest } from "msw";
import * as testAssets from "./assets.json";
//import { PAGE_SIZE } from "renft-front/consts";
import { enableMapSet } from "immer";
import * as Sentry from "@sentry/nextjs";
import { getContractWithProvider } from "renft-front/utils";

enableMapSet();

jest.mock("zustand");
jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("web3modal");
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
jest.mock("@sentry/nextjs", () => {
  return {
    captureException: jest.fn(),
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
    ERC755_REFETCH_INTERVAL: 2000,
  };
});
jest.mock("next/router");

import LendPage from "renft-front/pages/lend";
let OLD_ENV: NodeJS.ProcessEnv;

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
const intervalServerError = { message: "Interval Server error" };

const waitForRefetch = async (screen) => {
  // wait for refetch to complete
  await waitFor(() => {
    expect(screen.queryByTestId("list-loader")).toBeInTheDocument();
  });
  await waitFor(
    () => {
      expect(screen.queryByTestId("list-loader")).not.toBeInTheDocument();
    },
    { timeout: 2000 }
  );
};
const uniswapRequest = (rest) => {
  return rest.post(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          data: {
            bundles: [
              {
                ethPriceUSD: 1,
              },
            ],
          },
        })
      );
    }
  );
};
beforeAll(() => {
  jest.resetModules();
  jest.spyOn(console, "error").mockImplementation();
  jest.spyOn(console, "warn").mockImplementation();
  jest.spyOn(console, "log").mockImplementation();
  OLD_ENV = { ...process.env };
  process.env.NEXT_PUBLIC_OPENSEA_API = "https://api.opensea";
  process.env.NEXT_PUBLIC_OPENSEA_API_KEY = "fdsafa8";
  process.env.NEXT_PUBLIC_RENFT_API = "https://renftapi";
  process.env.NEXT_PUBLIC_EIP721_API = "https://eip721";
  process.env.NEXT_PUBLIC_EIP1155_API = "https://eip1155";
  process.env.NEXT_PUBLIC_NETWORK_SUPPORTED = "mainnet";
  process.env.NEXT_PUBLIC_CORS_PROXY = "https://dummy-cors-proxy";
  process.env.NEXT_PUBLIC_SHOW_MINT = false;
  process.env.NEXT_PUBLIC_FETCH_NFTS_DEV = undefined;
  process.env.NEXT_PUBLIC_DEBUG = undefined;
  const observe = jest.fn();
  const unobserve = jest.fn();

  // you can also pass the mock implementation
  // to jest.fn as an argument
  global.window.IntersectionObserver = jest.fn(() => ({
    observe,
    unobserve,
  }));
});

afterAll(() => {
  process.env = OLD_ENV;
  console.error.mockRestore();
  console.log.mockRestore();
  console.warn.mockRestore();
  Sentry.captureException.mockRestore();
  getContractWithProvider.mockRestore();
  global.window.IntersectionObserver.mockRestore();
});

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

  beforeEach(() => {
    console.log.mockReset();
    console.warn.mockReset();
    console.error.mockReset();
  });
  afterEach(() => {
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
  });

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => {
    if (mswServer) mswServer.resetHandlers();
    jest.clearAllMocks();
  });

  // Disable API mocking after the tests are done.
  afterAll(() => mswServer && mswServer.close());

  it("renders empty content when EIP_1155 server errors", async () => {
    mswServer.use(
      rest.post(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(200), ctx.json({ data: [] }));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(200), ctx.json({ tokens: [] }));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(500), ctx.json(intervalServerError));
      }),

      uniswapRequest(rest),
      // empty opensea
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      })
    );
    await act(async () => {
      render(<LendPage />);
    });

    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 1500,
    });

    await waitFor(() => {
      const message = screen.getByText(/you don't have any nfts to lend/i);

      expect(message).toBeInTheDocument();
    });
  }, 2000);

  it("should log to sentry when EIP_721 errors", async () => {
    mswServer.use(
      rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(500), ctx.json(intervalServerError));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: [],
          })
        );
      }),

      // empty opensea
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      }),

      uniswapRequest(rest),
      // catch all for ipfs data
      rest.get("*", (req, res, ctx) => {
        return {
          image: null,
          description: "",
          name: "",
        };
      })
    );
    await act(async () => {
      render(<LendPage />);
    });

    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 3500,
    });
    await waitFor(() => {
      // TODO:eniko decrease the amount
      expect(Sentry.captureException).toHaveBeenCalledTimes(5);
    });
  });
  it("should show EIP721 response", async () => {
    mswServer.use(
      rest.post(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(EIP721_response));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      }),

      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(testAssets));
      }),
      uniswapRequest(rest),
      // catch all for ipfs data
      rest.get("*", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            image: null,
            description: "",
            name: "",
          })
        );
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
      rest.post(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(EIP1155_response));
      }),

      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(testAssets));
      }),
      uniswapRequest(rest),
      // catch all for ipfs data
      rest.get("*", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            image: null,
            description: "",
            name: "",
          })
        );
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
      rest.post(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(EIP721_response));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(EIP1155_response));
      }),

      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(testAssets));
      }),
      uniswapRequest(rest),
      // catch all for ipfs data
      rest.get("*", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            image: null,
            description: "",
            name: "",
          })
        );
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
        rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
          // Respond with "500 Internal Server Error" status for this test.
          return res(ctx.status(200), ctx.json(EIP721_response));
        }),
        rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
          // Respond with "500 Internal Server Error" status for this test.
          return res(ctx.status(200), ctx.json(EIP1155_response));
        }),

        // empty opensea
        rest.get(
          `${process.env.NEXT_PUBLIC_OPENSEA_API}/*`,
          async (req, res, ctx) => {
            return res(ctx.status(200), ctx.json({}));
          }
        ),
        uniswapRequest(rest),
        // catch all for ipfs data
        rest.get("*", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              image: null,
              description: "",
              name: "",
            })
          );
        })
      );

      await act(async () => {
        render(<LendPage />);
      });

      await waitFor(() => {
        const loader = screen.getByTestId("list-loader");
        expect(loader).toBeInTheDocument();
      });
      await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
        timeout: 1500,
      });
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
        rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
          // Respond with "500 Internal Server Error" status for this test.
          return res(ctx.status(200), ctx.json(EIP721_response));
        }),
        rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
          // Respond with "500 Internal Server Error" status for this test.
          return res(ctx.status(200), ctx.json(EIP1155_response));
        }),

        // empty opensea
        rest.get(
          `${process.env.NEXT_PUBLIC_OPENSEA_API}/*`,
          async (req, res, ctx) => {
            return res(ctx.status(200), ctx.json({}));
          }
        ),

        uniswapRequest(rest),
        // catch all for ipfs data
        rest.get("*", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              image: null,
              description: "",
              name: "",
            })
          );
        })
      );
      await act(async () => {
        render(<LendPage />);
      });

      await waitFor(() => {
        const loader = screen.getByTestId("list-loader");
        expect(loader).toBeInTheDocument();
      });
      await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
        timeout: 1500,
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

    xit("bug with item selection", async () => {
      mswServer.use(
        rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
          // Respond with "500 Internal Server Error" status for this test.
          return res(ctx.status(200), ctx.json(EIP721_response));
        }),
        rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
          // Respond with "500 Internal Server Error" status for this test.
          return res(ctx.status(200), ctx.json(EIP1155_response));
        }),

        // empty opensea
        rest.get(
          `${process.env.NEXT_PUBLIC_OPENSEA_API}/*`,
          async (req, res, ctx) => {
            return res(ctx.status(200), ctx.json({}));
          }
        ),
        uniswapRequest(rest),
        // catch all for ipfs data
        rest.get("*", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              image: null,
              description: "",
              name: "",
            })
          );
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
      mswServer.resetHandlers();
      mswServer.use(
        rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(EIP721_response));
        }),
        rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({}));
        }),

        // empty opensea
        rest.get(
          `${process.env.NEXT_PUBLIC_OPENSEA_API}/*`,
          async (req, res, ctx) => {
            return res(ctx.status(200), ctx.json({}));
          }
        ),
        // catch all for ipfs data
        rest.get("*", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              image: null,
              description: "",
              name: "",
            })
          );
        })
      );
      // rerender
      await act(async () => {
        rerender(<LendPage />);
      });

      await waitForRefetch(screen);
      await waitFor(() => {
        screen.getAllByTestId("catalogue-item-loaded");
      });
      let button2;
      await waitFor(
        () => {
          // Only one item
          expect(
            screen.getAllByRole("button", {
              name: /lend/i,
            }).length
          ).toBe(1);
          button2 = screen.getByRole("button", {
            name: /lend/i,
          });
        },
        {
          timeout: 10000,
        }
      );
      await act(async () => {
        user.click(button2);
      });

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      const list2 = screen.getAllByRole("listitem");
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
        rest.post(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({}));
        }),
        rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(EIP721_response));
        }),
        rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(EIP155_response));
        }),

        rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(testAssets));
        }),
        uniswapRequest(rest),
        // catch all for ipfs data
        rest.get("*", (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              image: null,
              description: "",
              name: "",
            })
          );
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
        rest.post(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(EIP721_response));
        }),
        rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ tokens: [] }));
        }),
        rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(EIP155_response));
        }),

        // empty opensea
        rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({}));
        }),

        uniswapRequest(rest),
        // catch all for ipfs data
        rest.get("*", (req, res, ctx) => {
          return {
            image: null,
            description: "",
            name: "",
          };
        })
      );

      await act(async () => {
        render(<LendPage />);
      });

      await waitFor(() => {
        const loader = screen.getByTestId("list-loader");
        expect(loader).toBeInTheDocument();
      });
      await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
        timeout: 1500,
      });

      await waitFor(() => {
        const message = screen.queryByLabelText(/Filter/i);

        expect(message).not.toBeInTheDocument();
      });
    });
    it("show not show sort on lend page", async () => {
      mswServer.use(
        rest.post(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(EIP721_response));
        }),
        rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ tokens: [] }));
        }),
        rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(EIP155_response));
        }),

        // empty opensea
        rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({}));
        }),

        uniswapRequest(rest),
        // catch all for ipfs data
        rest.get("*", (req, res, ctx) => {
          return {
            image: null,
            description: "",
            name: "",
          };
        })
      );

      await act(async () => {
        render(<LendPage />);
      });

      await waitFor(() => {
        const loader = screen.getByTestId("list-loader");
        expect(loader).toBeInTheDocument();
      });
      await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
        timeout: 1500,
      });

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
