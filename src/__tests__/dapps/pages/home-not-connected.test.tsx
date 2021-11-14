import React from "react";
import { render, screen, waitFor, within, act } from "@testing-library/react";
import { SetupServerApi } from "msw/node";
import * as testLendings from "./lendings.json";
import * as testAssets from "./assets.json";
import { PAGE_SIZE } from "renft-front/consts";

import user from "@testing-library/user-event";
jest.mock("renft-front/hooks/store/useSnackProvider");
jest.mock("renft-front/hooks/store/useWallet", () => {
  return {
    useWallet: jest.fn(() => ({
      network: "mainnet",
    })),
  };
});

import Home from "renft-front/pages/index";

jest.mock("next/router", () => {
  return {
    useRouter: jest.fn().mockReturnValue({
      pathname: "/",
      events: { on: jest.fn(), off: jest.fn() },
    }),
  };
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
  });

  // Disable API mocking after the tests are done.
  afterAll(() => mswServer && mswServer.close());

  it("renders empty rentals", async () => {
    mswServer.use(...mockResponse());

    act(() => {
      render(<Home />);
    });

    await waitFor(() => {
      const message = screen.getByTestId("empty-message");

      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent(/you can't rent anything yet/i);
    });
  });
  // TODO:eniko show error message when API is down
  it("renders empty rentals on error", async () => {
    mswServer.use(
      ...mockResponse({
        renftapi: {
          status: 500,
          json: { message: "Interval server error" },
        },
      })
    );
    act(() => {
      render(<Home />);
    });

    await waitForRefetch(screen);
    await waitFor(() => {
      const message = screen.getByTestId("empty-message");

      expect(message).toBeInTheDocument();
      expect(message).toHaveTextContent(/you can't rent anything yet/i);
    });
  });

  it("renders rentals returned by API", async () => {
    mswServer.use(
      ...mockResponse({
        renftapi: {
          status: 200,
          json: testLendings,
        },
        openseaapi: {
          status: 200,
          json: testAssets,
        },
      })
    );

    act(() => {
      render(<Home />);
    });

    await waitForRefetch(screen);
    // shows actual cards
    await waitFor(() => {
      const items = screen.getAllByTestId("catalogue-item-loaded");

      expect(items).toMatchSnapshot();

      expect(items.length).toBe(PAGE_SIZE);
    });
  }, 5000);

  it("when wallet not connected cannot select elements", async () => {
    mswServer.use(
      ...mockResponse({
        renftapi: {
          status: 200,
          json: testLendings,
        },
        openseaapi: {
          status: 200,
          json: testAssets,
        },
      })
    );

    act(() => {
      render(<Home />);
    });

    await waitForRefetch(screen);
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
    });
  }, 5000);

  it("shows wallet owner lended items in rental tab", async () => {
    const lendingsArr = [...testLendings.data.lendings];
    lendingsArr[0].lenderAddress = "dummy wallet address";
    const lendings = {
      data: { lendings: lendingsArr },
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
      render(<Home />);
    });

    await waitForRefetch(screen);
    await waitFor(() => {
      screen.getAllByTestId("catalogue-item-loaded");
    });

    // shows actual cards
    await waitFor(() => {
      const list = screen.getByRole("grid", {
        name: /nfts/i,
      });
      const lendItems = within(list).queryAllByRole("gridcell", {
        selected: false,
        name: /lending/i,
      });

      expect(lendItems.length).toBe(1);

      const items = within(list).queryAllByRole("gridcell", {
        selected: false,
      });

      expect(items.length).toBe(PAGE_SIZE);
      items.forEach((item) => {
        const catItem = within(item);
        expect(catItem.getByRole("checkbox")).toHaveAttribute("disabled");
        expect(catItem.getByTestId("catalogue-action")).toHaveAttribute(
          "disabled"
        );
      });
    });
  }, 15_000);

  describe("filter", () => {
    //todo
    it("show collection filter if there are collections", async () => {
      const assets = [...testAssets.assets];
      assets[0].tokenId = testLendings.data.lendings[0].tokenId;
      assets[0].asset_contract.address =
        testLendings.data.lendings[0].nftAddress;
      assets[1].tokenId = testLendings.data.lendings[1].tokenId;
      assets[1].asset_contract.address =
        testLendings.data.lendings[1].nftAddress;
      mswServer.use(
        ...mockResponse({
          renftapi: {
            status: 200,
            json: testLendings,
          },

          openseaapi: {
            status: 200,
            json: { assets },
          },
        })
      );

      await act(async () => {
        render(<Home />);
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
          renftapi: {
            status: 200,
            json: testLendings,
          },

          openseaapi: {
            status: 200,
            json: testAssets,
          },
        })
      );

      await act(async () => {
        render(<Home />);
      });
      await waitForRefetch(screen);
      await waitFor(() => {
        const message = screen.queryByLabelText(/Filter/i);

        expect(message).not.toBeInTheDocument();
      });
    });
    it("show sort on rent page", async () => {
      mswServer.use(
        ...mockResponse({
          renftapi: {
            status: 200,
            json: testLendings,
          },

          openseaapi: {
            status: 200,
            json: testAssets,
          },
        })
      );

      await act(async () => {
        render(<Home />);
      });
      await waitForRefetch(screen);
      await waitFor(() => {
        const message = screen.queryByLabelText(/Sort/i);

        expect(message).toBeInTheDocument();
      });
    });
    it("filters items based on collection", async () => {
      const assets = [...testAssets.assets];
      assets[0].tokenId = testLendings.data.lendings[0].tokenId;
      assets[0].asset_contract.address =
        testLendings.data.lendings[0].nftAddress;
      assets[1].tokenId = testLendings.data.lendings[1].tokenId;
      assets[1].asset_contract.address =
        testLendings.data.lendings[1].nftAddress;

      mswServer.use(
        ...mockResponse({
          renftapi: {
            status: 200,
            json: testLendings,
          },

          openseaapi: {
            status: 200,
            json: { assets },
          },
        })
      );

      await act(async () => {
        render(<Home />);
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
      act(() => {
        const filter = screen.getByText(/all Nfts/i);
        user.click(filter);
      });
      const collection = screen.getByRole("option", {
        name: testAssets.assets[0].collection.name,
      });
      expect(collection).toBeInTheDocument();

      act(() => {
        user.click(collection);
        //click outside
        user.click(global.document.body);
      });
      // filter should be shown
      expect(screen.getByLabelText(/Filter/i)).toHaveTextContent(
        testAssets.assets[0].collection.name
      );

      await waitFor(() => {
        expect(screen.queryAllByTestId("catalogue-item-loaded").length).toBe(1);
      });
    });

    it("can clear filter", async () => {
      const assets = [...testAssets.assets];
      assets[0].tokenId = testLendings.data.lendings[0].tokenId;
      assets[0].asset_contract.address =
        testLendings.data.lendings[0].nftAddress;
      assets[1].tokenId = testLendings.data.lendings[1].tokenId;
      assets[1].asset_contract.address =
        testLendings.data.lendings[1].nftAddress;

      mswServer.use(
        ...mockResponse({
          renftapi: {
            status: 200,
            json: testLendings,
          },

          openseaapi: {
            status: 200,
            json: { assets },
          },
        })
      );

      await act(async () => {
        render(<Home />);
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
      act(() => {
        const filter = screen.getByText(/all Nfts/i);
        user.click(filter);
      });
      const collection = screen.getByRole("option", {
        name: testAssets.assets[0].collection.name,
      });
      expect(collection).toBeInTheDocument();

      act(() => {
        user.click(collection);
        //click outside
        user.click(global.document.body);
      });
      // filter should be shown
      expect(screen.getByLabelText(/Filter/i)).toHaveTextContent(
        testAssets.assets[0].collection.name
      );

      await waitFor(() => {
        expect(screen.queryAllByTestId("catalogue-item-loaded").length).toBe(1);
      });
      //reset
      act(() => {
        const filter = screen.getByText(testAssets.assets[0].collection.name);
        user.click(filter);
      });
      const clearFilter = screen.getByRole("option", {
        name: /all nfts/i,
      });
      expect(clearFilter).toBeInTheDocument();
      act(() => {
        const filter = screen.getByText(/all nfts/i);
        user.click(filter);
      });
      await waitFor(() => {
        expect(screen.queryAllByTestId("catalogue-item-loaded").length).toBe(
          20
        );
      });
    });

    it("filter dropdown shows all available options in dropdown", async () => {
      const assets = [...testAssets.assets];
      assets[0].tokenId = testLendings.data.lendings[0].tokenId;
      assets[0].asset_contract.address =
        testLendings.data.lendings[0].nftAddress;
      assets[1].tokenId = testLendings.data.lendings[1].tokenId;
      assets[1].asset_contract.address =
        testLendings.data.lendings[1].nftAddress;

      mswServer.use(
        ...mockResponse({
          renftapi: {
            status: 200,
            json: testLendings,
          },

          openseaapi: {
            status: 200,
            json: { assets },
          },
        })
      );

      await act(async () => {
        render(<Home />);
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
      act(() => {
        const filter = screen.getByText(/all Nfts/i);
        user.click(filter);
      });
      const filter = screen.getByLabelText(/Filter/i, { selector: "ul" });
      const dropdown = within(filter);
      const collections = dropdown.getAllByRole("option");
      expect(collections.length).toBe(14);
    });

    it("filter doesn't return collection which has no matching nft", async () => {
      const assets = [...testAssets.assets];
      assets[0].tokenId = testLendings.data.lendings[0].tokenId;
      assets[0].asset_contract.address =
        testLendings.data.lendings[0].nftAddress;
      assets[1].tokenId = testLendings.data.lendings[1].tokenId;
      assets[1].asset_contract.address =
        testLendings.data.lendings[1].nftAddress;

      assets.push({
        tokenId: "dummy token id",
        asset_contract: {
          address: "dummy contract address",
          name: "dummy collection",
          description: "dummy collection description",
        },
        collection: {
          name: "dummy collection",
          description: "dummy collection description",
        },
      });
      const index = assets.length - 1;
      mswServer.use(
        ...mockResponse({
          renftapi: {
            status: 200,
            json: testLendings,
          },

          openseaapi: {
            status: 200,
            json: { assets },
          },
        })
      );

      await act(async () => {
        render(<Home />);
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
      act(() => {
        const filter = screen.getByText(/all Nfts/i);
        user.click(filter);
      });
      const collection = screen.queryByRole("option", {
        name: assets[index].collection.name,
      });
      expect(collection).not.toBeInTheDocument();
    });
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
