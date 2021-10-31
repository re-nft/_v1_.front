import React from "react";
import {
  render,
  screen,
  waitFor,
  act,
  within,
  fireEvent,
} from "@testing-library/react";

import user from "@testing-library/user-event";
import { Nft } from "renft-front/types/classes";
import { LendForm } from "renft-front/components/forms/lend/lend-form";
import { useStartLend } from "renft-front/hooks/contract/useStartLend";
import { useNFTApproval } from "renft-front/hooks/contract/useNFTApproval";
import { useNftsStore } from "renft-front/hooks/store/useNftStore";

jest.mock("renft-front/hooks/contract/useStartLend", () => {
  return {
    __esModule: true,

    useStartLend: jest.fn().mockReturnValue({
      status: {
        isLoading: false,
        hasFailure: false,
        status: 5,
      },
      startLend: jest.fn(),
    }),
  };
});
jest.mock("renft-front/hooks/contract/useNFTApproval", () => {
  return {
    __esModule: true,
    useNFTApproval: jest.fn().mockReturnValue({
      handleApproveAll: jest.fn(),
      isApproved: true,
      approvalStatus: jest.fn(),
    }),
  };
});
jest.mock("renft-front/hooks/store/useNftStore", () => {
  return {
    __esModule: true,
    useLendingStore: jest.fn().mockReturnValue({ lendings: {} }),
    useRentingStore: jest.fn().mockReturnValue({ rentings: {} }),

    useNftsStore: jest.fn().mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {},
      };
      return fn(state);
    }),
  };
});

describe("Lend form", () => {
  let nft1: Nft;
  let nft2: Nft;
  beforeEach(() => {
    nft2 = new Nft("dummy address 2", "token id 2", false);
    nft1 = new Nft("dummy address 1", "token id 1", true);
  });
  it("renders zero item, when no item is provided", async () => {
    await act(async () =>
      render(<LendForm checkedItems={[]} onClose={jest.fn()} />)
    );
    await waitFor(() => {
      expect(screen.getByRole("form")).toBeVisible();
    });
    expect(screen.queryByRole("listitem")).toBeNull();
  });
  describe("react to user events", () => {
    beforeEach(() => {
      nft2 = new Nft("dummy address 2", "token id 2", false);
      nft1 = new Nft("dummy address 1", "token id 1", true);
    });
    it("should be able to fill out amount for erc1155", async () => {
      useNftsStore.mockImplementation((fn) => {
        const amounts = new Map();
        amounts.set(nft2.nId, 20);

        const state = {
          amounts,
          nfts: {
            [`${nft2.nId}`]: nft2,
          },
        };
        return fn(state);
      });
      await act(async () =>
        render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
      );
      await waitFor(() => {
        expect(screen.getByRole("form")).toBeVisible();
      });
      const list = screen.getAllByRole("listitem");
      const item = within(list[0]);

      await act(async () => {
        const amountField = item.getByLabelText(/^amount$/i);
        user.clear(amountField);
      });

      expect(item.getByLabelText(/^amount$/i)).toHaveValue("");
      await act(async () => {
        const amountField = item.getByLabelText(/^amount$/i);
        user.type(amountField, "2");
      });

      expect(item.getByLabelText(/^amount$/i)).toHaveValue("2");
    });
    it("should not be able to fill out amount for erc721", async () => {
      useNftsStore.mockImplementation((fn) => {
        const amounts = new Map();

        const state = {
          amounts,
          nfts: {
            [`${nft1.nId}`]: nft1,
          },
        };
        return fn(state);
      });
      await act(async () =>
        render(<LendForm checkedItems={[nft1.nId]} onClose={jest.fn()} />)
      );
      await waitFor(() => {
        expect(screen.getByRole("form")).toBeVisible();
      });

      const list = screen.getAllByRole("listitem");
      const item = within(list[0]);
      expect(item.getByLabelText(/^amount$/i)).toBeDisabled();
      await act(async () => {
        const amountField = item.getByLabelText(/^amount$/i);
        user.clear(amountField);
      });

      expect(item.getByLabelText(/^amount$/i)).toHaveValue("1");
      await act(async () => {
        const amountField = item.getByLabelText(/^amount$/i);
        user.type(amountField, "2");
      });

      expect(item.getByLabelText(/^amount$/i)).toHaveValue("1");
    });
    it("should be able to fill out borrow price", async () => {
      useNftsStore.mockImplementation((fn) => {
        const amounts = new Map();

        const state = {
          amounts,
          nfts: {
            [`${nft1.nId}`]: nft1,
          },
        };
        return fn(state);
      });
      await act(async () =>
        render(<LendForm checkedItems={[nft1.nId]} onClose={jest.fn()} />)
      );
      await waitFor(() => {
        expect(screen.getByRole("form")).toBeVisible();
      });

      const list = screen.getAllByRole("listitem");
      const item = within(list[0]);
      const label = /^borrow price$/i;
      expect(item.getByLabelText(label)).toHaveValue("");
      await act(async () => {
        const field = item.getByLabelText(label);
        user.clear(field);
      });

      expect(item.getByLabelText(label)).toHaveValue("");
      await act(async () => {
        const field = item.getByLabelText(label);
        user.type(field, "2");
      });

      expect(item.getByLabelText(label)).toHaveValue("2");
    });
    it("should be able to fill out collateral", async () => {
      useNftsStore.mockImplementation((fn) => {
        const amounts = new Map();

        const state = {
          amounts,
          nfts: {
            [`${nft1.nId}`]: nft1,
          },
        };
        return fn(state);
      });
      await act(async () =>
        render(<LendForm checkedItems={[nft1.nId]} onClose={jest.fn()} />)
      );
      await waitFor(() => {
        expect(screen.getByRole("form")).toBeVisible();
      });

      const list = screen.getAllByRole("listitem");
      const item = within(list[0]);
      const label = /^collateral$/i;
      expect(item.getByLabelText(label)).toHaveValue("");
      await act(async () => {
        const field = item.getByLabelText(label);
        user.clear(field);
      });

      expect(item.getByLabelText(label)).toHaveValue("");
      await act(async () => {
        const field = item.getByLabelText(label);
        user.type(field, "2");
      });

      expect(item.getByLabelText(label)).toHaveValue("2");
    });
    describe("should be able to change payment token", () => {
      ["WETH", "USDC", "USDT", "TUSD", "DAI"].map((token) => {
        it(`to ${token}`, async () => {
          useNftsStore.mockImplementation((fn) => {
            const amounts = new Map();

            const state = {
              amounts,
              nfts: {
                [`${nft1.nId}`]: nft1,
              },
            };
            return fn(state);
          });
          await act(async () =>
            render(<LendForm checkedItems={[nft1.nId]} onClose={jest.fn()} />)
          );
          await waitFor(() => {
            expect(screen.getByRole("form")).toBeVisible();
          });

          const list = screen.getAllByRole("listitem");
          expect(list.length).toBe(1);
          const item = within(list[0]);
          const label = /^payment token$/i;
          expect(item.getByLabelText(label)).toHaveAttribute(
            "aria-expanded",
            "false"
          );

          await act(async () => {
            const option = item.getByLabelText(label);
            user.click(option);
          });

          await act(async () => {
            const re = new RegExp(`^${token}$`, "i");
            const field = item.getByText(re);
            user.click(field);
          });
          await waitFor(() => {
            expect(item.getByLabelText(label)).toHaveTextContent(token);
          });
        });
      });
    });
  });
  it("should not allow submit when form invalid", async () => {
    await act(async () =>
      render(<LendForm checkedItems={[nft1.nId]} onClose={jest.fn()} />)
    );
    await waitFor(() => {
      expect(screen.getByRole("form")).toBeVisible();
    });
    expect(
      screen.getByRole("button", {
        name: /Lend/i,
      })
    ).toBeDisabled();
  });
  it("should show approve button if one nft if not approved", async () => {
    useNFTApproval.mockReturnValue({
      handleApproveAll: jest.fn(),
      isApproved: false,
      approvalStatus: jest.fn(),
    });
    await act(async () =>
      render(<LendForm checkedItems={[nft1.nId]} onClose={jest.fn()} />)
    );
    await waitFor(() => {
      expect(screen.getByRole("form")).toBeVisible();
    });
    expect(
      screen.getByRole("button", {
        name: /Approve/i,
      })
    ).not.toBeDisabled();
  });
  describe("should show validation message for each invalid field ", () => {
    describe("amount validation", () => {
      it("should show required when user clears the field", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^amount$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");
        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Amount must be number"
        );
      });
      it("should show required when user enters less then 1", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^amount$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");
        await act(async () => {
          user.type(item.getByLabelText(label), "0");
        });

        expect(item.getByLabelText(label)).toHaveValue("0");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Amount must be greater or equal than 1"
        );
      });
      it("should show required when user enters more than amount", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^amount$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");

        await act(async () => {
          await user.type(item.getByLabelText(label), "21", { delay: 0.01 });
        });

        expect(item.getByLabelText(label)).toHaveValue("21");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Amount cannot be greater than available amount"
        );
      });
      it("should show error when not number", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^amount$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");

        await act(async () => {
          await user.type(item.getByLabelText(label), "abc", { delay: 0.01 });
        });

        expect(item.getByLabelText(label)).toHaveValue("abc");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Amount must be number"
        );
      });
      it("should show error when has text", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^amount$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");

        await act(async () => {
          await user.type(item.getByLabelText(label), "12a", { delay: 0.01 });
        });

        expect(item.getByLabelText(label)).toHaveValue("12a");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Amount must be number"
        );
      });
      it("should show error when not integer", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^amount$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");

        await act(async () => {
          await user.type(item.getByLabelText(label), "11.2", { delay: 0.01 });
        });

        expect(item.getByLabelText(label)).toHaveValue("11.2");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Amount must be an integer"
        );
      });
    });
    describe("max lend duration validation", () => {
      it("should show required when user clears the field", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^max lend duration$/i;
        await act(async () => {
          user.type(item.getByLabelText(label), "0");
        });

        expect(item.getByLabelText(label)).toHaveValue("0");
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");
        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Max lend duration must be number"
        );
      });
      it("should show required when user enters less then 1", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^max lend duration$/i;
        await act(async () => {
          user.type(item.getByLabelText(label), "0");
        });

        expect(item.getByLabelText(label)).toHaveValue("0");

        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");
        await act(async () => {
          user.type(item.getByLabelText(label), "0");
        });

        expect(item.getByLabelText(label)).toHaveValue("0");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Max lend duration must be greater or equal than 1"
        );
      });
      it("should show required when user enters more than 255", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^max lend duration$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");

        await act(async () => {
          await user.type(item.getByLabelText(label), "256", { delay: 0.01 });
        });

        expect(item.getByLabelText(label)).toHaveValue("256");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Max lend duration cannot be greater than 255"
        );
      });
      it("should show error when not number", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^max lend duration$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");

        await act(async () => {
          await user.type(item.getByLabelText(label), "abc", { delay: 0.01 });
        });

        expect(item.getByLabelText(label)).toHaveValue("abc");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Max lend duration must be number"
        );
      });
      it("should show error when has text", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^max lend duration$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");

        await act(async () => {
          await user.type(item.getByLabelText(label), "12a", { delay: 0.01 });
        });

        expect(item.getByLabelText(label)).toHaveValue("12a");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Max lend duration must be number"
        );
      });
      it("should show error when not integer", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^max lend duration$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");

        await act(async () => {
          await user.type(item.getByLabelText(label), "11.2", { delay: 0.01 });
        });

        expect(item.getByLabelText(label)).toHaveValue("11.2");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Max lend duration must be an integer"
        );
      });
    });
    describe("collateral validation", () => {
      it("should show required when user clears the field", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^collateral$/i;
        await act(async () => {
          user.type(item.getByLabelText(label), "1");
        });

        expect(item.getByLabelText(label)).toHaveValue("1");
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");
        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Collateral * required"
        );
      });
      it("should show required when user enters less then 0.0001", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^collateral$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");
        await act(async () => {
          await user.type(item.getByLabelText(label), "0.00001", {
            delay: 0.001,
          });
        });

        expect(item.getByLabelText(label)).toHaveValue("0.00001");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Collateral must be greater or equal 0.0001 and less or equal to 9999.9999 with maximum 4 precision"
        );
      });
      it("should show required when user enters less then 0", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^collateral$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");
        await act(async () => {
          await user.type(item.getByLabelText(label), "-0.00001", {
            delay: 0.001,
          });
        });

        expect(item.getByLabelText(label)).toHaveValue("-0.00001");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Collateral must be greater or equal 0.0001 and less or equal to 9999.9999 with maximum 4 precision"
        );
      });
      it("should show required when user enters more then 9999.9999", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^collateral$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");
        await act(async () => {
          await user.type(item.getByLabelText(label), "10000.0001", {
            delay: 0.001,
          });
        });

        expect(item.getByLabelText(label)).toHaveValue("10000.0001");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Collateral must be greater or equal 0.0001 and less or equal to 9999.9999 with maximum 4 precision"
        );
      });
      it("should show required when user enters incorrect precision", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^collateral$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");
        await act(async () => {
          await user.type(item.getByLabelText(label), "777.11112", {
            delay: 0.001,
          });
        });

        expect(item.getByLabelText(label)).toHaveValue("777.11112");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Collateral must be greater or equal 0.0001 and less or equal to 9999.9999 with maximum 4 precision"
        );
      });

      it("should show error when not number", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^collateral$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");

        await act(async () => {
          await user.type(item.getByLabelText(label), "abc", { delay: 0.01 });
        });

        expect(item.getByLabelText(label)).toHaveValue("abc");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Collateral must be greater or equal 0.0001 and less or equal to 9999.9999 with maximum 4 precision"
        );
      });
      it("should show error when has text", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^collateral$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");

        await act(async () => {
          await user.type(item.getByLabelText(label), "12a", { delay: 0.01 });
        });

        expect(item.getByLabelText(label)).toHaveValue("12a");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Collateral must be greater or equal 0.0001 and less or equal to 9999.9999 with maximum 4 precision"
        );
      });
    });
    describe("borrow price", () => {
      it("should show required when user clears the field", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^borrow price$/i;
        await act(async () => {
          user.type(item.getByLabelText(label), "1");
        });

        expect(item.getByLabelText(label)).toHaveValue("1");
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");
        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Borrow price * required"
        );
      });
      it("should show required when user enters less then 0.0001", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^borrow price$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");
        await act(async () => {
          await user.type(item.getByLabelText(label), "0.00001", {
            delay: 0.001,
          });
        });

        expect(item.getByLabelText(label)).toHaveValue("0.00001");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Borrow price must be greater or equal 0.0001 and less or equal to 9999.9999 with maximum 4 precision"
        );
      });
      it("should show required when user enters less then 0", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^borrow price$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");
        await act(async () => {
          await user.type(item.getByLabelText(label), "-0.00001", {
            delay: 0.001,
          });
        });

        expect(item.getByLabelText(label)).toHaveValue("-0.00001");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Borrow price must be greater or equal 0.0001 and less or equal to 9999.9999 with maximum 4 precision"
        );
      });
      it("should show required when user enters more then 9999.9999", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^borrow price$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");
        await act(async () => {
          await user.type(item.getByLabelText(label), "10000.0001", {
            delay: 0.001,
          });
        });

        expect(item.getByLabelText(label)).toHaveValue("10000.0001");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Borrow price must be greater or equal 0.0001 and less or equal to 9999.9999 with maximum 4 precision"
        );
      });
      it("should show required when user enters incorrect precision", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^borrow price$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");
        await act(async () => {
          await user.type(item.getByLabelText(label), "777.11112", {
            delay: 0.001,
          });
        });

        expect(item.getByLabelText(label)).toHaveValue("777.11112");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Borrow price must be greater or equal 0.0001 and less or equal to 9999.9999 with maximum 4 precision"
        );
      });

      it("should show error when not number", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^borrow price$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");

        await act(async () => {
          await user.type(item.getByLabelText(label), "abc", { delay: 0.01 });
        });

        expect(item.getByLabelText(label)).toHaveValue("abc");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Borrow price must be greater or equal 0.0001 and less or equal to 9999.9999 with maximum 4 precision"
        );
      });
      it("should show error when has text", async () => {
        useNftsStore.mockImplementation((fn) => {
          const amounts = new Map();
          amounts.set(nft2.nId, 20);

          const state = {
            amounts,
            nfts: {
              [`${nft2.nId}`]: nft2,
            },
          };
          return fn(state);
        });
        await act(async () =>
          render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
        );
        await waitFor(() => {
          expect(screen.getByRole("form")).toBeVisible();
        });
        const list = screen.getAllByRole("listitem");
        const item = within(list[0]);

        const label = /^borrow price$/i;
        await act(async () => {
          user.clear(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveValue("");

        await act(async () => {
          await user.type(item.getByLabelText(label), "12a", { delay: 0.01 });
        });

        expect(item.getByLabelText(label)).toHaveValue("12a");

        await act(async () => {
          fireEvent.blur(item.getByLabelText(label));
        });

        expect(item.getByLabelText(label)).toHaveErrorMessage(
          "Borrow price must be greater or equal 0.0001 and less or equal to 9999.9999 with maximum 4 precision"
        );
      });
    });
    // TODO error messages are not shown
    xdescribe("payment token validation", () => {});
  });
  describe("should restore previous saved state", () => {
    it("for amount", async () => {
      useNftsStore.mockImplementation((fn) => {
        const amounts = new Map();
        amounts.set(nft2.nId, 20);

        const state = {
          amounts,
          nfts: {
            [`${nft2.nId}`]: nft2,
          },
        };
        return fn(state);
      });
      await act(async () => {
        render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />);
      });
      await waitFor(() => {
        expect(screen.getByRole("form")).toBeVisible();
      });
      const list = screen.getAllByRole("listitem");
      const item = within(list[0]);

      const label = /^amount$/i;
      await act(async () => {
        await user.clear(item.getByLabelText(label));
        await user.type(item.getByLabelText(label), "10", { delay: 0.001 });
      });

      expect(item.getByLabelText(label)).toHaveValue("10");
      await act(async () =>
        render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
      );

      expect(item.getByLabelText(label)).toHaveValue("10");
    });
    it("for lend duration", async () => {
      useNftsStore.mockImplementation((fn) => {
        const amounts = new Map();
        amounts.set(nft2.nId, 20);

        const state = {
          amounts,
          nfts: {
            [`${nft2.nId}`]: nft2,
          },
        };
        return fn(state);
      });
      await act(async () => {
        render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />);
      });
      await waitFor(() => {
        expect(screen.getByRole("form")).toBeVisible();
      });
      const list = screen.getAllByRole("listitem");
      const item = within(list[0]);

      const label = /^max lend duration$/i;
      await act(async () => {
        await user.clear(item.getByLabelText(label));
        await user.type(item.getByLabelText(label), "10", { delay: 0.001 });
      });

      expect(item.getByLabelText(label)).toHaveValue("10");
      await act(async () =>
        render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
      );

      expect(item.getByLabelText(label)).toHaveValue("10");
    });
    it("for collateral", async () => {
      useNftsStore.mockImplementation((fn) => {
        const amounts = new Map();
        amounts.set(nft2.nId, 20);

        const state = {
          amounts,
          nfts: {
            [`${nft2.nId}`]: nft2,
          },
        };
        return fn(state);
      });
      await act(async () => {
        render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />);
      });
      await waitFor(() => {
        expect(screen.getByRole("form")).toBeVisible();
      });
      const list = screen.getAllByRole("listitem");
      const item = within(list[0]);

      const label = /^collateral$/i;
      await act(async () => {
        await user.clear(item.getByLabelText(label));
        await user.type(item.getByLabelText(label), "10", { delay: 0.001 });
      });

      expect(item.getByLabelText(label)).toHaveValue("10");
      await act(async () =>
        render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
      );

      expect(item.getByLabelText(label)).toHaveValue("10");
    });
    it("for borrow price", async () => {
      useNftsStore.mockImplementation((fn) => {
        const amounts = new Map();
        amounts.set(nft2.nId, 20);

        const state = {
          amounts,
          nfts: {
            [`${nft2.nId}`]: nft2,
          },
        };
        return fn(state);
      });
      await act(async () => {
        render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />);
      });
      await waitFor(() => {
        expect(screen.getByRole("form")).toBeVisible();
      });
      const list = screen.getAllByRole("listitem");
      const item = within(list[0]);

      const label = /^borrow price$/i;
      await act(async () => {
        await user.clear(item.getByLabelText(label));
        await user.type(item.getByLabelText(label), "10", { delay: 0.001 });
      });

      expect(item.getByLabelText(label)).toHaveValue("10");
      await act(async () =>
        render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
      );

      expect(item.getByLabelText(label)).toHaveValue("10");
    });
    it("for payment token", async () => {
      useNftsStore.mockImplementation((fn) => {
        const amounts = new Map();

        const state = {
          amounts,
          nfts: {
            [`${nft1.nId}`]: nft1,
          },
        };
        return fn(state);
      });
      await act(async () =>
        render(<LendForm checkedItems={[nft1.nId]} onClose={jest.fn()} />)
      );
      await waitFor(() => {
        expect(screen.getByRole("form")).toBeVisible();
      });

      const list = screen.getAllByRole("listitem");
      expect(list.length).toBe(1);
      const item = within(list[0]);
      const label = /^payment token$/i;
      await act(async () => {
        const option = item.getByLabelText(label);
        user.click(option);
      });

      await act(async () => {
        const re = new RegExp(`^DAI$`, "i");
        const field = item.getByText(re);
        user.click(field);
      });
      await waitFor(() => {
        expect(item.getByLabelText(label)).toHaveTextContent("DAI");
      });
      await act(async () =>
        render(<LendForm checkedItems={[nft1.nId]} onClose={jest.fn()} />)
      );
      expect(item.getByLabelText(label)).toHaveTextContent("DAI");
    });
  });
  describe("list edit", () => {
    it("should allow removing the right item from list", async () => {
      useNftsStore.mockImplementation((fn) => {
        const amounts = new Map();

        const state = {
          amounts,
          nfts: {
            [`${nft1.nId}`]: nft1,
            [`${nft2.nId}`]: nft2,
          },
        };
        return fn(state);
      });
      await act(async () =>
        render(
          <LendForm checkedItems={[nft1.nId, nft2.nId]} onClose={jest.fn()} />
        )
      );
      await waitFor(() => {
        expect(screen.getByRole("form")).toBeVisible();
      });

      const list = screen.getAllByRole("listitem");
      expect(list.length).toBe(2);
      const item = within(list[0]);
      const label = /^Remove$/i;
      await act(async () => {
        const option = item.getByText(label);
        user.click(option);
      });

      await waitFor(() => {
        const grid = screen.getAllByRole("listitem");
        expect(grid.length).toBe(1);
        const item2 = within(grid[0]);
        expect(item2.getByText(nft2.tokenId)).toBeInTheDocument();
      });
    });
    it("should allow removing the last item from list", async () => {
      useNftsStore.mockImplementation((fn) => {
        const amounts = new Map();

        const state = {
          amounts,
          nfts: {
            [`${nft1.nId}`]: nft1,
          },
        };
        return fn(state);
      });
      await act(async () =>
        render(<LendForm checkedItems={[nft1.nId]} onClose={jest.fn()} />)
      );
      await waitFor(() => {
        expect(screen.getByRole("form")).toBeVisible();
      });

      const list = screen.getAllByRole("listitem");
      expect(list.length).toBe(1);
      const item = within(list[0]);
      const label = /^Remove$/i;
      await act(async () => {
        const option = item.getByText(label);
        user.click(option);
      });

      expect(screen.queryAllByRole("listitem").length).toBe(0);
    });
  });
  it("should allow submitting if form is valid and nfts approved", async () => {
    useNftsStore.mockImplementation((fn) => {
      const amounts = new Map();
      amounts.set(nft2.nId, 20);
      const state = {
        amounts,
        nfts: {
          [`${nft2.nId}`]: nft2,
        },
      };
      return fn(state);
    });
    useNFTApproval.mockReturnValue({
      handleApproveAll: jest.fn(),
      isApproved: true,
      approvalStatus: jest.fn(),
    });
    const startLend = jest.fn();
    useStartLend.mockReturnValue({
      status: {
        isLoading: false,
        hasFailure: false,
        status: 5,
      },
      startLend,
    });

    await act(async () =>
      render(<LendForm checkedItems={[nft2.nId]} onClose={jest.fn()} />)
    );
    await waitFor(() => {
      expect(screen.getByRole("form")).toBeVisible();
    });
    const list = screen.getAllByRole("listitem");
    expect(list.length).toBe(1);
    const item = within(list[0]);
    act(() => {
      user.clear(item.getByLabelText(/^amount$/i));
    });

    expect(item.getByLabelText(/^amount$/i)).toHaveValue("");
    await act(async () => {
      await user.type(item.getByLabelText(/^amount$/i), "10", {
        delay: 0.001,
      });
    });
    expect(item.getByLabelText(/^amount$/i)).toHaveValue("10");
    await act(async () => {
      await user.type(item.getByLabelText(/^max lend duration$/i), "10", {
        delay: 0.001,
      });
    });

    expect(item.getByLabelText(/^max lend duration$/i)).toHaveValue("10");
    await act(async () => {
      await user.type(item.getByLabelText(/^borrow price$/i), "10", {
        delay: 0.001,
      });
    });

    expect(item.getByLabelText(/^borrow price$/i)).toHaveValue("10");
    await act(async () => {
      await user.type(item.getByLabelText(/^collateral$/i), "10", {
        delay: 0.001,
      });
    });

    expect(item.getByLabelText(/^collateral$/i)).toHaveValue("10");
    act(() => {
      user.click(item.getByLabelText(/Payment token/i));
    });
    act(() => {
      user.click(item.getByText("DAI"));
    });

    await waitFor(() => {
      expect(item.getByLabelText(/Payment token/i)).toHaveTextContent("DAI");
    });

    expect(
      screen.getByRole("button", {
        name: /Lend/i,
      })
    ).not.toBeDisabled();
    act(() => {
      user.click(
        screen.getByRole("button", {
          name: /Lend/i,
        })
      );
    });
    await waitFor(() => {
      expect(item.getByLabelText(/Payment token/i)).toHaveTextContent("DAI");
    });

    expect(startLend).toBeCalledWith([
      {
        amount: "20",
        borrowPrice: "10",
        lendAmount: 10,
        maxDuration: 10,
        nft: {
          _meta: undefined,
          id: "dummy address 2::token id 2::0",
          isERC721: false,
          isVerified: false,
          mediaURI: "",
          nId: "dummy address 2::token id 2::0",
          nftAddress: "dummy address 2",
          openseaURI: "",
          raribleURI: "",
          tokenId: "token id 2",
          tokenURI: "",
        },
        nftAddress: "dummy address 2",
        nftPrice: "10",
        pmToken: 2,
        tokenId: "token id 2",
      },
    ]);
  });
});
