import React from "react";
import {
  render,
  screen,
  waitFor,
  act,
  within,
  fireEvent,
} from "@testing-library/react";
import { enableMapSet } from "immer";
import user from "@testing-library/user-event";
import { Lending } from "renft-front/types/classes";
import { useLendingStore } from "renft-front/hooks/store/useNftStore";
import { RentForm } from "renft-front/components/forms/rent/rent-form";
import {
  useRentApproval,
  useStartRent,
} from "renft-front/hooks/contract/useStartRent";
enableMapSet();
jest.mock("zustand");

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");
jest.mock("@ethersproject/address", () => {
  return {
    __esModule: true,
    getAddress: jest.fn().mockImplementation((a: string) => a),
  };
});
jest.mock("renft-front/hooks/contract/useStartRent", () => {
  return {
    __esModule: true,
    useStartRent: jest.fn().mockImplementation(() => ({
      status: {
        isLoading: false,
        hasFailure: false,
        status: 5,
      },
      startRent: jest.fn(),
    })),
    useRentApproval: jest.fn().mockImplementation(() => ({
      isApproved: false,
      handleApproveAll: jest.fn(),
      checkApprovals: jest.fn(),
      status: {
        key: "1",
        hasFailure: false,
        hasPending: false,
      },
    })),
  };
});
jest.mock("renft-front/hooks/store/useNftStore", () => {
  return {
    __esModule: true,
    useLendingStore: jest.fn().mockImplementation(),
  };
});
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation();
  jest.spyOn(console, "warn").mockImplementation();
  jest.spyOn(console, "log").mockImplementation();
});
afterAll(() => {
  console.error.mockRestore();
  console.log.mockRestore();
  console.warn.mockRestore();
});

describe("Rent form", () => {
  let lendingerc721: Lending;
  let lendingerc1155: Lending;
  beforeEach(() => {
    console.log.mockReset();
    console.warn.mockReset();
    console.error.mockReset();
    lendingerc721 = new Lending({
      id: "lending id 1",
      nftAddress: "dummy contract address 1",
      tokenId: "dummy token id 1",
      lenderAddress: "someone else",
      maxRentDuration: "10",
      dailyRentPrice: "2",
      nftPrice: "4",
      paymentToken: "3",
      lentAmount: "1",
      collateralClaimed: false,
      isERC721: true,
      renting: null, //  has no renting
    });
    lendingerc1155 = new Lending({
      id: "lending id 2",
      lentAmount: "20",
      nftAddress: "dummy contract address 2",
      tokenId: "dummy token id 2",
      lenderAddress: "someone else",
      maxRentDuration: "12",
      dailyRentPrice: "4",
      nftPrice: "7.5",
      paymentToken: "4",
      collateralClaimed: false,
      isERC721: false,
      renting: null, //  has no renting
    });
    useLendingStore.mockImplementation((fn) => {
      const state = {
        lendings: {
          [`${lendingerc721.id}`]: lendingerc721,
          [`${lendingerc1155.id}`]: lendingerc1155,
        },
      };
      return fn(state);
    });
  });
  afterEach(() => {
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("renders zero item, when no item is provided", async () => {
    await act(async () =>
      render(<RentForm checkedItems={[]} onClose={jest.fn()} />)
    );
    expect(screen.queryByRole("listitem")).toBeNull();
  });

  it("should be able to fill out rent duration", async () => {
    await act(async () =>
      render(<RentForm checkedItems={[lendingerc721.id]} onClose={jest.fn()} />)
    );
    const list = screen.getAllByRole("listitem");
    const item = within(list[0]);

    const label = /rent duration/i;
    await act(async () => {
      const amountField = item.getByLabelText(label);
      user.clear(amountField);
    });

    expect(item.getByLabelText(label)).toHaveValue("");
    await act(async () => {
      const amountField = item.getByLabelText(label);
      user.type(amountField, "2");
    });

    expect(item.getByLabelText(label)).toHaveValue("2");
  });
  it("should show approve button if payment token is not approved", async () => {
    const handleApproveAll = jest.fn();
    const checkApprovals = jest.fn();

    const label = /rent duration/i;
    useRentApproval.mockImplementation(() => ({
      isApproved: false,
      handleApproveAll,
      checkApprovals,
      status: {
        key: "1",
        hasFailure: false,
        hasPending: false,
      },
    }));

    await act(async () =>
      render(<RentForm checkedItems={[lendingerc721.id]} onClose={jest.fn()} />)
    );
    const list = screen.getAllByRole("listitem");
    const item = within(list[0]);

    expect(
      screen.getByRole("button", {
        name: /Approve/i,
      })
    ).not.toBeDisabled();
    act(() => {
      user.click(
        screen.getByRole("button", {
          name: /Approve/i,
        })
      );
    });
    expect(item.getByLabelText(label)).toHaveValue("");
    expect(checkApprovals).toHaveBeenCalledWith([
      {
        duration: "",
        ...lendingerc721,
      },
    ]);
    expect(handleApproveAll).toHaveBeenCalled();
  });

  it("should show rent button disabled", async () => {
    useRentApproval.mockImplementation(() => ({
      isApproved: true,
      handleApproveAll: jest.fn(),
      checkApprovals: jest.fn(),
      status: {
        key: "1",
        hasFailure: false,
        hasPending: false,
      },
    }));
    await act(async () =>
      render(<RentForm checkedItems={[lendingerc721.id]} onClose={jest.fn()} />)
    );
    expect(
      screen.getByRole("button", {
        name: /Rent/i,
      })
    ).toBeDisabled();
  });

  describe("should show validation message for amount", () => {
    const label = /rent duration/i;
    it("should show required when empty", async () => {
      await act(async () =>
        render(
          <RentForm checkedItems={[lendingerc721.id]} onClose={jest.fn()} />
        )
      );

      const list = screen.getAllByRole("listitem");
      const item = within(list[0]);
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
        "Rent duration must be number"
      );
    });

    it("should not allow negative number", async () => {
      await act(async () =>
        render(
          <RentForm checkedItems={[lendingerc721.id]} onClose={jest.fn()} />
        )
      );

      const list = screen.getAllByRole("listitem");
      const item = within(list[0]);

      await act(async () => {
        await user.type(item.getByLabelText(label), "-123", { delay: 0.001 });
      });

      expect(item.getByLabelText(label)).toHaveValue("-123");
      await act(async () => {
        fireEvent.blur(item.getByLabelText(label));
      });

      expect(item.getByLabelText(label)).toHaveErrorMessage(
        "Rent duration must be greater or equal than 1"
      );
    });
    it("should not greater than max duration", async () => {
      await act(async () =>
        render(
          <RentForm checkedItems={[lendingerc721.id]} onClose={jest.fn()} />
        )
      );

      const list = screen.getAllByRole("listitem");
      const item = within(list[0]);

      await act(async () => {
        await user.type(item.getByLabelText(label), "22", { delay: 0.001 });
      });

      expect(item.getByLabelText(label)).toHaveValue("22");
      await act(async () => {
        fireEvent.blur(item.getByLabelText(label));
      });

      expect(item.getByLabelText(label)).toHaveErrorMessage(
        "Rent duration cannot be greater than maximum duration"
      );
    });

    it("should not allow non-number", async () => {
      await act(async () =>
        render(
          <RentForm checkedItems={[lendingerc721.id]} onClose={jest.fn()} />
        )
      );

      const list = screen.getAllByRole("listitem");
      const item = within(list[0]);

      await act(async () => {
        await user.type(item.getByLabelText(label), "abc", { delay: 0.001 });
      });

      expect(item.getByLabelText(label)).toHaveValue("abc");
      await act(async () => {
        fireEvent.blur(item.getByLabelText(label));
      });

      expect(item.getByLabelText(label)).toHaveErrorMessage(
        "Rent duration must be number"
      );
    });
    it("should not allow float", async () => {
      await act(async () =>
        render(
          <RentForm checkedItems={[lendingerc721.id]} onClose={jest.fn()} />
        )
      );

      const list = screen.getAllByRole("listitem");
      const item = within(list[0]);

      await act(async () => {
        await user.type(item.getByLabelText(label), "1.1", { delay: 0.001 });
      });

      expect(item.getByLabelText(label)).toHaveValue("1.1");
      await act(async () => {
        fireEvent.blur(item.getByLabelText(label));
      });

      expect(item.getByLabelText(label)).toHaveErrorMessage(
        "Rent duration must be an integer"
      );
    });
  });
  it("should restore previous saved state for rent duration", async () => {
    const label = /rent duration/i;
    await act(async () =>
      render(<RentForm checkedItems={[lendingerc721.id]} onClose={jest.fn()} />)
    );

    const list = screen.getAllByRole("listitem");
    const item = within(list[0]);

    await act(async () => {
      await user.type(item.getByLabelText(label), "5", { delay: 0.001 });
    });

    expect(item.getByLabelText(label)).toHaveValue("5");

    await act(async () =>
      render(<RentForm checkedItems={[lendingerc721.id]} onClose={jest.fn()} />)
    );

    expect(item.getByLabelText(label)).toHaveValue("5");
  });

  describe("list edit", () => {
    it("should allow removing the right item from list", async () => {
      await act(async () =>
        render(
          <RentForm
            checkedItems={[lendingerc721.id, lendingerc1155.id]}
            onClose={jest.fn()}
          />
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
        expect(item2.getByText("1155")).toBeInTheDocument();
      });
    });
    it("should allow removing the last item from list", async () => {
      await act(async () =>
        render(
          <RentForm checkedItems={[lendingerc721.id]} onClose={jest.fn()} />
        )
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

  it("should allow submitting when the form is valid and token is approved", async () => {
    const label = /rent duration/i;
    useRentApproval.mockImplementation(() => ({
      isApproved: true,
      handleApproveAll: jest.fn(),
      checkApprovals: jest.fn(),
      status: {
        key: "1",
        hasFailure: false,
        hasPending: false,
      },
    }));
    const startRent = jest.fn();
    useStartRent.mockImplementation(() => ({
      status: {
        isLoading: false,
        hasFailure: false,
        status: 5,
      },
      startRent,
    }));

    await act(async () =>
      render(<RentForm checkedItems={[lendingerc721.id]} onClose={jest.fn()} />)
    );
    const list = screen.getAllByRole("listitem");
    const item = within(list[0]);

    await act(async () => {
      await user.type(item.getByLabelText(label), "5", { delay: 0.001 });
    });

    expect(item.getByLabelText(label)).toHaveValue("5");

    expect(
      screen.getByRole("button", {
        name: /Rent/i,
      })
    ).not.toBeDisabled();

    act(() => {
      user.click(
        screen.getByRole("button", {
          name: /Rent/i,
        })
      );
    });
    //dummy wait
    await waitFor(() => {
      expect(item.getByLabelText(label)).toHaveValue("5");
    });

    expect(startRent).toHaveBeenCalledWith([
      {
        amount: lendingerc721.lentAmount,
        isERC721: false,
        lendingId: "lending id 1",
        nftAddress: "dummy contract address 1",
        paymentToken: 3,
        rentDuration: 5,
        tokenId: "dummy token id 1",
      },
    ]);
  });
});
