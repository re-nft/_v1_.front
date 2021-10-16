import React from "react";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import { SetupServerApi } from "msw/node";
import { rest } from "msw";
import * as testLendings from "./lendings.json";
import * as testAssets from "./assets.json";
import { sleep } from "renft-front/utils";
import { PAGE_SIZE } from "renft-front/consts";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("renft-front/hooks/store/useSnackProvider");
jest.mock("renft-front/hooks/store/useWallet", () => {
  return {
    useWallet: jest.fn(() => ({
      network: "mainnet",
    })),
  };
});
jest.mock("renft/front/hooks/store/useContracts");

import Home from "renft-front/pages/index";
let OLD_ENV: NodeJS.ProcessEnv;

beforeAll(() => {
  jest.resetModules();
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
  OLD_ENV = { ...process.env };
  process.env.NEXT_PUBLIC_OPENSEA_API = "https://api.opensea";
  process.env.NEXT_PUBLIC_RENFT_API = "https://renftapi";
  process.env.NEXT_PUBLIC_EIP721_API = "https://eip721";
  process.env.NEXT_PUBLIC_EIP1155_API = "https://eip1155";
  process.env.NEXT_PUBLIC_NETWORK_SUPPORTED = "mainnet";
});

afterAll(() => {
  process.env = OLD_ENV;
  console.error.mockRestore();
  console.log.mockRestore();
});

describe("Home", () => {
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
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

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

      expect(spyLog).not.toHaveBeenCalled();
      expect(spyWarn).not.toHaveBeenCalled();
    });
  });
  // TODO:eniko show error message when API is down
  it("renders empty rentals on error", async () => {
    const spy = jest.spyOn(global.console, "warn");
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
      expect(spy).toHaveBeenCalled();
    });
  });

  it("renders rentals returned by API", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

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
          await sleep(1000);
          return res(ctx.status(200), ctx.json(testAssets));
        }
      ),
      // catch all for ipfs data
      rest.get("*", (req, res, ctx) => {
        return {
          image: null,
          description: "",
          name: "",
        };
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

    // shows skeletons first
    await screen.findAllByTestId("catalouge-item-skeleton");
    await waitForElementToBeRemoved(
      () => screen.getAllByTestId("catalouge-item-skeleton"),
      {
        timeout: 3500,
      }
    );

    // shows actual cards
    await waitFor(() => {
      const items = screen.getAllByTestId("catalogue-item-loaded");

      expect(items).toMatchSnapshot();

      expect(items.length).toBe(PAGE_SIZE);

      expect(spyLog).not.toHaveBeenCalled();
      expect(spyWarn).not.toHaveBeenCalled();
    });
  }, 5000);

  it("when wallet not connected cannot select elements", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

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
        return {
          image: null,
          description: "",
          name: "",
        };
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

    // shows actual cards
    await waitFor(() => {
      const list = screen.getByRole("grid", {
        name: /nfts/i,
      });
      const items = within(list).getAllByRole("gridcell", {
        selected: false,
      });

      expect(items.length).toBe(PAGE_SIZE);
      items.forEach((item) => {
        const { getByRole } = within(item);
        expect(getByRole("checkbox")).toHaveAttribute("disabled");
        expect(getByRole("button", { name: /rent/i })).toHaveAttribute(
          "disabled"
        );
      });
      expect(spyLog).not.toHaveBeenCalled();
      expect(spyWarn).not.toHaveBeenCalled();
    });
  }, 5000);

  it("shows wallet owner lended items in rental tab", () => {});
  it("shows correct details returned by API on cards", () => {});
  it("show images for nfts", () => {});
  it("show empty placeholders for nfts", () => {});

  describe("rent form open", () => {
    it("show rent form when 1 item selected with item details", () => {});
    it("show rent form when 2 item selected with selected items details", () => {});
    it("shows filled out details when modal was filled before (1 item)", () => {});
    it("shows filled out details when modal was filled before (multiple item)", () => {});
    it("when items selected and filled out and item rented out(api removed) form does not show it", () => {});
  });

  describe("filter", () => {
    //todo
    it("filter items out based on collection name", () => {});
    it("filter shows only matches", () => {});
    it("filter dropdown shows all available options in dropdown", () => {});
    it("filter dropdown empty filter shows all items based on page", () => {});
  });

  describe("filter + paging works together (multiple case)", () => {});
  describe("filter + sort works together (multiple case)", () => {});
  describe("sort + paging works together (multiple case)", () => {});
  describe("filter + sort + paging works together (multiple case)", () => {});
  describe("sort", () => {
    //todo
    it("sort reset sorts based on nId by default", () => {});
    it("sorts items based on rental date desc", () => {});
    it("sorts items based on rental date asc", () => {});
    it("sorts items based on collateral desc", () => {});
    it("sorts items based on collateral asc", () => {});
    it("sorts items based on daily rent price desc", () => {});
    it("sorts items based on daily rent price desc", () => {});
  });

  describe("paging", () => {
    it("show items based on page number based on initial sort", () => {});
    it("items are not duplicated between pages", () => {});
    it("prev page works as intended", () => {});
    it("next page works as intended", () => {});
    it("page jump works as intended", () => {});
  });
});
