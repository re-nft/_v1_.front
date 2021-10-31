import React from "react";
import { render, screen, waitFor, within, act } from "@testing-library/react";
import { SetupServerApi } from "msw/node";
import * as testAssets from "../assets.json";

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

jest.mock("next/router", () => {
  return {
    useRouter: jest.fn().mockReturnValue({
      pathname: "/dashboard/lending",
      events: { on: jest.fn(), off: jest.fn() },
    }),
  };
});
jest.mock("renft-front/hooks/misc/useTimestamp", () => {
  return {
    __esModule: true,
    useTimestamp: jest.fn().mockImplementation(() => {
      return Date.now();
    }),
  };
});

import Page from "renft-front/pages/dashboard/lending";

describe("User is lending when wallet connected ", () => {
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

  it("renders clickable lent items with right state", async () => {
    const lendingsArr = [
      {
        // defaultstate
        collateralClaimed: false,
        dailyRentPrice: "0x0000005a",
        id: "103",
        isERC721: true,
        lenderAddress: "0x48ddea6de8c0393a26e2590a3b724fc47abdcf22",
        lentAmount: "1",
        lentAt: "1627407065",
        maxRentDuration: "15",
        nftAddress: "0xc3f733ca98e0dad0386979eb96fb1722a1a05e69",
        nftPrice: "0x000005dc",
        paymentToken: "1",
        tokenId: "20581",
      },
      {
        //claimed
        collateralClaimed: true,
        dailyRentPrice: "0x00010000",
        id: "105",
        isERC721: false,
        lenderAddress: "0xd39ea6043d1fa03f5be2beb2cfe65faa4ef0e595",
        lentAmount: "1",
        lentAt: "1627447207",
        maxRentDuration: "5",
        nftAddress: "0xfaff15c6cdaca61a4f87d329689293e07c98f578",
        nftPrice: "0x00140000",
        paymentToken: "3",
        renting: {
          id: "105",
          rentDuration: "1",
          rentedAt: (Date.now() - 48 * 60 * 60 * 1000) / 1000,
          renterAddress: "0x8b6e96947349c5efabd44bd8f8901d31951202c6",
        },
        tokenId: "1",
      },
      {
        //claimable
        collateralClaimed: false,
        dailyRentPrice: "0x00000064",
        id: "106",
        isERC721: true,
        lenderAddress: "0xbc2a432a01a64b5bdc9360c22b6603c60e96c867",
        lentAmount: "1",
        lentAt: "1627468549",
        maxRentDuration: "100",
        nftAddress: "0x9d413b9434c20c73f509505f7fbc6fc591bbf04a",
        nftPrice: "0x00001388",
        paymentToken: "1",
        renting: {
          id: "105",
          rentDuration: "1",
          rentedAt: (Date.now() - 48 * 60 * 60 * 1000) / 1000,
          renterAddress: "0x8b6e96947349c5efabd44bd8f8901d31951202c6",
        },
        tokenId: "7085325",
      },
      {
        //hasRenting, not expired
        collateralClaimed: false,
        dailyRentPrice: "0x00140000",
        id: "107",
        isERC721: false,
        lenderAddress: "0x75dc67127f851a3fefd38a9183a09803364c575c",
        lentAmount: "1",
        lentAt: "1627484931",
        maxRentDuration: "7",
        nftAddress: "0x0db8c099b426677f575d512874d45a767e9acc3c",
        nftPrice: "0x01f40000",
        paymentToken: "2",
        renting: {
          id: "107",
          rentDuration: "1",
          rentedAt: (Date.now() - 20000) / 1000,
          renterAddress: "0x000000041d22b34812630f07f7b3be152f430aa9",
        },
        tokenId: "1",
      },
    ];
    const lendings = {
      data: {
        users: [{ lending: lendingsArr }],
      },
    };

    mswServer.use(
      ...mockResponse({
        renftapi: {
          status: 200,
          json: lendings,
        },
        openseaapi: {
          status: 200,
          json: testAssets,
        },
      })
    );

    act(() => {
      render(<Page />);
    });

    await waitForRefetch(screen);
    await waitFor(() => {
      const list = screen.getByRole("grid", {
        name: /nfts/i,
      });
      const items = within(list).getAllByRole("gridcell", {
        selected: false,
      });

      expect(items.length).toBe(4);
      expect(screen.getAllByRole("button", { name: /stop lend/i }).length).toBe(
        2
      );
      expect(screen.getAllByRole("button", { name: /claim/i }).length).toBe(2);
      const claimed = within(list).queryAllByTestId("claimed", {
        selected: false,
      });

      expect(claimed.length).toBe(1);
      claimed.forEach((item) => {
        const { getByRole, getByTestId } = within(item);
        expect(getByRole("checkbox")).toHaveAttribute("disabled");
        expect(getByTestId("catalogue-action")).toHaveAttribute("disabled");
      });
      const claimable = within(list).queryAllByTestId("claimable", {
        selected: false,
      });

      claimable.forEach((item) => {
        const { getByRole, getByTestId } = within(item);
        expect(getByRole("checkbox")).not.toHaveAttribute("disabled");
        expect(getByTestId("catalogue-action")).toHaveAttribute("disabled");
      });
      expect(claimable.length).toBe(1);
      const hasRenting = within(list).queryAllByTestId("hasRenting", {
        selected: false,
      });

      expect(hasRenting.length).toBe(1);
      hasRenting.forEach((item) => {
        const { getByRole, getByTestId } = within(item);
        expect(getByRole("checkbox")).toHaveAttribute("disabled");
        expect(getByTestId("catalogue-action")).toHaveAttribute("disabled");
      });

      const defaultState = within(list).queryAllByTestId("default", {
        selected: false,
      });

      expect(defaultState.length).toBe(1);
      defaultState.forEach((item) => {
        const { getByRole, getByTestId } = within(item);
        expect(getByRole("checkbox")).not.toHaveAttribute("disabled");
        expect(getByTestId("catalogue-action")).toHaveAttribute("disabled");
      });
    });
  }, 15_000);
});
