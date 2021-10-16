import React from "react";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import user from "@testing-library/user-event";
import { SetupServerApi } from "msw/node";
import { rest } from "msw";
//import * as testAssets from "./assets.json";
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
  };
});

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
      },
    ],
  },
};
const intervalServerError = { message: "Interval Server error" };

beforeAll(() => {
  jest.resetModules();
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
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

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => {
    if (mswServer) mswServer.resetHandlers();
    jest.clearAllMocks();
  });

  // Disable API mocking after the tests are done.
  afterAll(() => mswServer && mswServer.close());
  it("renders empty content when no item returned by server", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

    mswServer.use(
      rest.post(`${process.env.NEXT_PUBLIC_RENFT_API}/*`, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(200), ctx.json({ data: [] }));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(200), ctx.json({ tokens: [] }));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(200), ctx.json({ account: { balances: [] } }));
      }),

      // empty opensea
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      }),
      // catch all for ipfs data
      rest.get("*", (req, res, ctx) => {
        return {
          image: null,
          description: "",
          name: "",
        };
      })
    );
    render(<LendPage />);

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
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  }, 2000);

  // TODO:eniko show error message when API is down
  it("renders empty content when EIP721_API server errors", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

    mswServer.use(
      rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(500), ctx.json(intervalServerError));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(200), ctx.json({ account: { balances: [] } }));
      }),

      // empty opensea
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      }),
      // catch all for ipfs data
      rest.get("*", (req, res, ctx) => {
        return {
          image: null,
          description: "",
          name: "",
        };
      })
    );

    render(<LendPage />);
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
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  }, 2000);

  it("renders empty content when EIP_1155 server errors", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

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

      // empty opensea
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      })
    );

    render(<LendPage />);
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
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  }, 2000);

  it("should show content from other APIs when EIP_721 errors", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

    mswServer.use(
      rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(500), ctx.json(intervalServerError));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(EIP1155_response));
      }),

      // empty opensea
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      }),
      // catch all for ipfs data
      rest.get("*", (req, res, ctx) => {
        return {
          image: null,
          description: "",
          name: "",
        };
      })
    );

    render(<LendPage />);
    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 3500,
    });

    await waitFor(() => {
      const items = screen.getAllByRole("gridcell");
      expect(items.length).toBe(1);
    });
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  });

  it("should show content from other APIs when EIP_1155 errors", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

    mswServer.use(
      rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(200), ctx.json(EIP721_response));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(500), ctx.json(intervalServerError));
      }),

      // empty opensea
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      }),
      // catch all for ipfs data
      rest.get("*", (req, res, ctx) => {
        return {
          image: null,
          description: "",
          name: "",
        };
      })
    );

    render(<LendPage />);
    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 3500,
    });

    await waitFor(() => {
      const items = screen.getAllByRole("gridcell");
      expect(items.length).toBe(1);
    });
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  }, 5000);

  it("should log to sentry when EIP_721 errors", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");
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
      // catch all for ipfs data
      rest.get("*", (req, res, ctx) => {
        return {
          image: null,
          description: "",
          name: "",
        };
      })
    );

    render(<LendPage />);
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

    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  });

  it("should log to sentry when EIP_1155 errors", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");
    mswServer.use(
      rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(EIP721_response));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(500), ctx.json(intervalServerError));
      }),
      // empty opensea
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ assets: [] }));
      }),
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

    render(<LendPage />);
    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 3500,
    });

    await waitFor(() => {
      expect(Sentry.captureException).toHaveBeenCalledTimes(5);
    });
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  });
  //TODO:eniko times are not consistent
  xit("should log to sentry when amount fetch errors", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

    getContractWithProvider.mockReturnValue({
      balanceOf: jest.fn().mockRejectedValue(),
    });
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
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      }),
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

    render(<LendPage />);
    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 3500,
    });

    await waitFor(() => {
      expect(getContractWithProvider).toHaveBeenCalledTimes(1);
      expect(Sentry.captureException).toHaveBeenCalledTimes(5);
    });
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  });
  //TODO:eniko we don't show the amount on the card anymore
  xit("renders item with empty amount when rejected", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");
    getContractWithProvider.mockReturnValue({
      balanceOf: jest.fn().mockRejectedValue(),
    });

    mswServer.use(
      rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(200), ctx.json({}));
      }),
      rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(200), ctx.json(EIP1155_response));
      }),

      // empty opensea
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      }),
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

    render(<LendPage />);
    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 3500,
    });

    await waitFor(() => {
      const item = screen.getByRole("gridcell");
      const { getByLabelText } = within(item);
      const amountDisplay = getByTestId(/amount/i);
      expect(amountDisplay).toContain("0");
    });
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  });
  //TODO:eniko ask design for this
  xit("renders refresh button when amount is not loaded", () => {
    expect(true).toBe(true);
  });
  // TODO assert amount, address, erc721 instead of snapshot
  it("renders item erc721, erc1555 with right details returned by API", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

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
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      }),
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

    render(<LendPage />);
    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 3500,
    });
    await waitFor(() => {
      const items = screen.getAllByTestId("catalogue-item-loaded");
      expect(items.length).toBe(2);
      const item1 = within(items[0]);
      expect(item1.getByTestId(/nft address/i)).toMatchInlineSnapshot(`
        <div
          class="flex-initial"
          data-testid="NFT Address"
        >
          <span
            aria-haspopup="true"
          >
            eip1155...ess
          </span>
        </div>
      `);
      expect(item1.getByTestId(/token id/i)).toMatchInlineSnapshot(`
        <div
          class="flex-initial"
          data-testid="Token id"
        >
          <span
            aria-haspopup="true"
          >
            eip1155...nid
          </span>
        </div>
      `);
      expect(item1.getByTestId(/standard/i)).toMatchInlineSnapshot(`
        <div
          class="flex-initial"
          data-testid="Standard"
        >
          1155
        </div>
      `);

      const item2 = within(items[1]);
      expect(item2.getByTestId(/nft address/i)).toMatchInlineSnapshot(`
        <div
          class="flex-initial"
          data-testid="NFT Address"
        >
          <span
            aria-haspopup="true"
          >
            eip721a...ess
          </span>
        </div>
      `);
      expect(item2.getByTestId(/token id/i)).toMatchInlineSnapshot(`
        <div
          class="flex-initial"
          data-testid="Token id"
        >
          <span
            aria-haspopup="true"
          >
            eip721t...nid
          </span>
        </div>
      `);
      expect(item2.getByTestId(/standard/i)).toMatchInlineSnapshot(`
        <div
          class="flex-initial"
          data-testid="Standard"
        >
          721
        </div>
      `);
    });
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  });
  it("show images when returned from opensea", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

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
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            assets: [
              {
                token_id: "eip721tokenid",
                image_url: "https://dummy-page/dummy-image-721.jpg",
                image_preview_url: "https://dummy-page/dummy-image-721.jpg",
                image_thumbnail_url: "https://dummy-page/dummy-image-721.jpg",
                image_original_url: "https://dummy-page/dummy-image-721.jpg",
                asset_contract: {
                  address: "eip721address",
                },
                name: "eip721image",
              },
              {
                token_id: "eip1155tokenid",
                image_url: "https://dummy-page/dummy-image-1155.jpg",
                image_preview_url: "https://dummy-page/dummy-image-1155.jpg",
                image_thumbnail_url: "https://dummy-page/dummy-image-1155.jpg",
                image_original_url: "https://dummy-page/dummy-image-1155.jpg",

                asset_contract: {
                  address: "eip1155address",
                },
                name: "eip1155image",
              },
            ],
          })
        );
      }),
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

    render(<LendPage />);
    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 3500,
    });
    await waitFor(() => {
      expect(
        screen.getByRole("img", { name: "eip721image" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "eip1155image" })
      ).toBeInTheDocument();
    });
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  });
  it("show images when returned from tokenURI", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

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
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            assets: [],
          })
        );
      }),
      // catch all for ipfs data
      rest.get("https://dummy-eip721", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            image: "https://dummysite/dummyimage.jpg",
            description: "",
            name: "eip721image",
          })
        );
      }),
      rest.get("https://dummy-eip1155", (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            image: "https://dummysite/dummyimage.jpg",
            description: "",
            name: "eip1155image",
          })
        );
      }),

      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      })
    );

    render(<LendPage />);
    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 3500,
    });
    await waitFor(() => {
      expect(
        screen.getByRole("img", { name: "eip721image" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "eip1155image" })
      ).toBeInTheDocument();
    });
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  });
  it("shows empty placeholders when no image is found", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

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
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            assets: [],
          })
        );
      }),
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      })
    );

    render(<LendPage />);
    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 3500,
    });
    await waitFor(() => {
      const noImages = screen.getAllByText(/no img/i);
      expect(noImages.length).toBe(2);
    });
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  });
  it("renders clickable items", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

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

    render(<LendPage />);

    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 1500,
    });
    await waitFor(() => {
      const list = screen.getByRole("grid", {
        name: /nfts/i,
      });

      const { getAllByRole } = within(list);
      let items = getAllByRole("gridcell", {
        selected: false,
      });
      expect(items.length).toBe(2);

      const firstItem = within(items[0]);
      const checkbox = firstItem.getByRole("checkbox");
      user.click(checkbox);
      expect(checkbox).toBeEnabled();

      const button = firstItem.getByRole("button", {
        name: /lend/i,
      });
      expect(button).not.toHaveAttribute("disabled");
      items = getAllByRole("gridcell", {
        selected: false,
      });
      expect(items.length).toBe(1);
    });
    expect(spyLog).not.toHaveBeenCalled();

    expect(spyWarn).not.toHaveBeenCalled();
  });
  //TODO:eniko
  // show loading indicator
  xit("can't select items with 0 amount", () => {});

  describe("lend form open", () => {
    it("show lend form when 1 item selected with item details", async () => {
      const spyLog = jest.spyOn(global.console, "log");
      const spyWarn = jest.spyOn(global.console, "warn");

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

      render(<LendPage />);

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
      const checkbox = firstItem.getByRole("checkbox");
      user.click(checkbox);

      const button = firstItem.getByRole("button", {
        name: /lend/i,
      });
      user.click(button);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      const list = screen.getByRole("listitem");
      expect(list).toBeInTheDocument();
      expect(spyLog).not.toHaveBeenCalled();

      expect(spyWarn).not.toHaveBeenCalled();
    });

    it("show lend form when 2 item selected with selected items details", async () => {
      const spyLog = jest.spyOn(global.console, "log");
      const spyWarn = jest.spyOn(global.console, "warn");

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

      render(<LendPage />);

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
      user.click(firstItem.getByRole("checkbox"));
      const secondItem = within(items[1]);
      user.click(secondItem.getByRole("checkbox"));

      const button = firstItem.getByRole("button", {
        name: /lend/i,
      });
      user.click(button);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      const list = screen.getAllByRole("listitem");
      expect(list.length).toBe(2);

      expect(spyLog).not.toHaveBeenCalled();
      expect(spyWarn).not.toHaveBeenCalled();
    });
    it("shows filled out details when modal was filled before (1 item)", () => {});
    it("shows filled out details when modal was filled before (multiple item)", () => {});
    it("when items selected and filled out and item lended out (form closed/form opened) form does not show it", () => {});
  });

  xdescribe("filter", () => {
    //todo
    it("filter items out based on collection name", () => {});
    it("filter shows only matches", () => {});
    it("filter dropdown shows all available options in dropdown", () => {});
    it("filter dropdown empty filter shows all items based on page", () => {});
  });

  xdescribe("filter + paging works together (multiple case)", () => {});
  xdescribe("filter + sort works together (multiple case)", () => {});
  xdescribe("sort + paging works together (multiple case)", () => {});
  xdescribe("filter + sort + paging works together (multiple case)", () => {});
  xdescribe("sort", () => {
    //todo
    it("sort reset sorts based on nId by default", () => {});
    it("sorts items based on rental date desc", () => {});
    it("sorts items based on rental date asc", () => {});
    it("sorts items based on collateral desc", () => {});
    it("sorts items based on collateral asc", () => {});
    it("sorts items based on daily rent price desc", () => {});
    it("sorts items based on daily rent price desc", () => {});
  });
  xdescribe("paging", () => {
    it("show items based on page number based on initial sort", () => {});
    it("items are not duplicated between pages", () => {});
    it("prev page works as intended", () => {});
    it("next page works as intended", () => {});
    it("page jump works as intended", () => {});
  });
});
