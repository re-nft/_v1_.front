import React from "react";
import {
  render,
  screen,
  waitFor,
  within,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import user from "@testing-library/user-event";
import { SetupServerApi } from "msw/node";
import { rest } from "msw";
import * as testLendings from "./lendings.json";
import * as testAssets from "./assets.json";
import { PAGE_SIZE } from "renft-front/consts";

import * as Sentry from "@sentry/nextjs";

jest.mock("zustand");
jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("next/router");

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
    __esModule: true,
    captureException: jest.fn(),
  };
});

import Home from "renft-front/pages/index";
let OLD_ENV: NodeJS.ProcessEnv;

beforeAll(() => {
  jest.resetModules();
  jest.spyOn(console, "error");
  jest.spyOn(console, "warn");
  jest.spyOn(console, "log");
  OLD_ENV = { ...process.env };
  //TODO:eniko this needs to be backward compatible
  process.env.NEXT_PUBLIC_OPENSEA_API = "https://api.opensea";
  process.env.NEXT_PUBLIC_OPENSEA_API_KEY = "https://api.opensea";
  process.env.NEXT_PUBLIC_RENFT_API = "https://renftapi";
  process.env.NEXT_PUBLIC_EIP721_API = "https://eip721";
  process.env.NEXT_PUBLIC_EIP1155_API = "https://eip1155";
  process.env.NEXT_PUBLIC_NETWORK_SUPPORTED = "mainnet";
});

afterAll(() => {
  process.env = OLD_ENV;
  console.error.mockRestore();
  console.log.mockRestore();
  console.warn.mockRestore();
});

describe("Home when wallet connected ", () => {
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

  it("renders empty rentals", async () => {
    mswServer.use(
      rest.post(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(200), ctx.json({ data: [] }));
      }),
      // empty opensea
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      })
    );

    render(<Home />);

    await waitFor(() => {
      const message = screen.getByTestId("empty-message");

      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent(/you can't rent anything yet/i);
    });
  });
  // TODO:eniko show error message when API is down
  it("renders empty rentals on error", async () => {
    mswServer.use(
      rest.post(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(
          ctx.status(500),
          ctx.json({ message: "Internal Server Error" })
        );
      }),
      // empty opensea
      rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
      })
    );

    render(<Home />);
    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 1500,
    });

    await waitFor(() => {
      const message = screen.getByTestId("empty-message");

      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent(/you can't rent anything yet/i);
      expect(Sentry.captureException).toHaveBeenCalled();
    });
  });

  it("renders clickable rental items", async () => {
    mswServer.use(
      rest.options(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
        return res(ctx.status(200));
      }),
      rest.post(`${process.env.NEXT_PUBLIC_RENFT_API}/*`, (req, res, ctx) => {
        // Respond with "500 Internal Server Error" status for this test.
        return res(ctx.status(200), ctx.json(testLendings));
      }),
      // empty opensea
      rest.get(
        `${process.env.NEXT_PUBLIC_OPENSEA_API}/*`,
        async (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(testAssets));
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

    render(<Home />);

    await waitFor(() => {
      const loader = screen.getByTestId("list-loader");
      expect(loader).toBeInTheDocument();
    });
    await waitForElementToBeRemoved(() => screen.getByTestId("list-loader"), {
      timeout: 1500,
    });
    const list = screen.getByRole("grid", {
      name: /nfts/i,
    });

    const { getAllByRole } = within(list);
    let items = getAllByRole("gridcell", {
      selected: false,
    });
    expect(items.length).toBe(PAGE_SIZE);
    await waitFor(() => {
      const firstItem = within(items[0]);
      const checkbox = firstItem.getByRole("checkbox");
      user.click(checkbox);
      expect(checkbox).toBeEnabled();

      const button = firstItem.getByRole("button", {
        name: /rent/i,
      });
      expect(button).not.toHaveAttribute("disabled");
      items = getAllByRole("gridcell", {
        selected: false,
      });
      expect(items.length).toBe(PAGE_SIZE - 1);
    });
  }, 5000);

  xit("renders item as lended in rentals when user is lender", () => {
    expect(false).toBe(true);
  });
});
