import React from "react";
import { render, screen, waitFor, within, act } from "@testing-library/react";
import user from "@testing-library/user-event";
import * as testLendings from "./lendings.json";
import * as testAssets from "./assets.json";
import { PAGE_SIZE } from "renft-front/consts";
import * as Sentry from "@sentry/nextjs";
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
jest.mock("next/router", () => {
  return {
    useRouter: jest.fn().mockReturnValue({
      pathname: "/",
      events: { on: jest.fn(), off: jest.fn() },
    }),
  };
});

jest.mock("renft-front/consts", () => {
  const actualModule = jest.requireActual("renft-front/consts");
  return {
    __esModule: true,
    ...actualModule,
    RENFT_REFETCH_INTERVAL: 5000,
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
    mswServer.use(...mockResponse(mswServer));
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
      ...mockResponse(mswServer, {
        renftapi: {
          status: 500,
          json: { message: "internal server error" },
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
      expect(Sentry.captureException).toHaveBeenCalled();
    });
  });

  it("renders clickable rental items", async () => {
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
        expect(getByRole("checkbox")).not.toHaveAttribute("disabled");
        expect(getByRole("button", { name: /rent/i })).toHaveAttribute(
          "disabled"
        );
      });
    });
  }, 5000);
  it("shows wallet owner lended items in rental tab", async () => {
    const lendingsArr = testLendings.data.lendings.map((item) => ({ ...item }));

    lendingsArr[0].lenderAddress = "dummy wallet address";
    const lendings = {
      data: {
        lendings: lendingsArr,
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
        name: /rent/i,
      });

      expect(items.length).toBe(PAGE_SIZE - 1);
      items.forEach((item) => {
        const catItem = within(item);
        expect(catItem.getByRole("checkbox")).not.toHaveAttribute("disabled");
        expect(catItem.getByTestId("catalogue-action")).toHaveAttribute(
          "disabled"
        );
      });
    });
  }, 15_000);
  describe("rent form open", () => {
    it("show rent form when 1 item selected with item details", async () => {
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
        screen.getAllByTestId("catalogue-item-loaded");
      });
      const grid = screen.getByRole("grid", {
        name: /nfts/i,
      });

      const { getAllByRole } = within(grid);
      const items = getAllByRole("gridcell", {
        selected: false,
      });
      expect(items.length).toBe(PAGE_SIZE);
      const firstItem = within(items[0]);
      const checkbox = firstItem.getByRole("checkbox");
      await act(async () => {
        user.click(checkbox);
      });

      const button = firstItem.getByRole("button", {
        name: /rent/i,
      });
      await act(async () => {
        user.click(button);
      });

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      const list = screen.getByRole("listitem");
      expect(list).toBeInTheDocument();
    });
    it("show rent form when 2 item selected with selected items details", async () => {
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
        const items = screen.getAllByTestId("catalogue-item-loaded");
        expect(items.length).toBe(PAGE_SIZE);
      });
      const grid = screen.getByRole("grid", {
        name: /nfts/i,
      });

      const { getAllByRole } = within(grid);
      const items = getAllByRole("gridcell", {
        selected: false,
      });
      expect(items.length).toBe(PAGE_SIZE);
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
        name: /rent/i,
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
          renftapi: {
            status: 200,
            json: {
              data: {
                lendings: [
                  testLendings.data.lendings[0],
                  testLendings.data.lendings[2],
                ],
              },
            },
          },
          openseaapi: {
            status: 200,
            json: testAssets,
          },
        })
      );

      let rerender;
      await act(async () => {
        const view = render(<Home />);
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
        name: /rent/i,
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
          ...mockResponse({
            renftapi: {
              status: 200,
              json: {
                data: {
                  lendings: [testLendings.data.lendings[0]],
                },
              },
            },
            openseaapi: {
              status: 200,
              json: testAssets,
            },
          })
        );
      });
      await act(async () => {
        rerender(<Home />);
      });
      // need to wait for the API to hit again
      await waitFor(
        () => {
          // Only one item
          expect(
            screen.queryAllByRole("button", {
              name: /rent/i,
            }).length
          ).toBe(1);
        },
        { timeout: 10000 }
      );
      await act(async () => {
        user.click(
          screen.getByRole("button", {
            name: /rent/i,
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
    }, 15_000);
  });
});
