import React from "react";
import {
  render,
  screen,
  waitFor,
  within,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import user from "@testing-library/user-event";
import * as testLendings from "./lendings.json";
import * as testAssets from "./assets.json";
import { PAGE_SIZE } from "renft-front/consts";
import * as Sentry from "@sentry/nextjs";
import { mockResponse, waitForRefetch } from "./test-utils";
import Home from "renft-front/pages/index";

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

import { SetupServerApi } from "msw/node";

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

describe("Home when wallet connected ", () => {
  it("renders empty rentals", async () => {
    mockResponse(mswServer);
    render(<Home />);

    await waitFor(() => {
      const message = screen.getByTestId("empty-message");

      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent(/you can't rent anything yet/i);
    });
  });
  // TODO:eniko show error message when API is down
  it("renders empty rentals on error", async () => {
    mockResponse(mswServer, {
      rentapi: {
        status: 500,
        json: { message: "internal server error" },
      },
    });

    render(<Home />);

    await waitForRefetch(screen);

    await waitFor(() => {
      const message = screen.getByTestId("empty-message");

      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent(/you can't rent anything yet/i);
      expect(Sentry.captureException).toHaveBeenCalled();
    });
  });

  it("renders clickable rental items", async () => {
    mockResponse(mswServer, {
      renftapi: {
        status: 200,
        json: testLendings,
      },
      openseaapi: {
        status: 200,
        json: testAssets,
      },
    });

    render(<Home />);

    await waitForRefetch(screen);

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
