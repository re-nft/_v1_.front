import { render, screen, act } from "@testing-library/react";
import UserIsLendingPage from "renft-front/pages/dashboard/lending";

jest.mock("next/router", () => {
  return {
    useRouter: jest.fn().mockReturnValue({
      pathname: "/dashboard/lending",
      events: { on: jest.fn(), off: jest.fn() },
    }),
  };
});

describe("User Lending page wallet is not connected", () => {
  it("shows connect message", async () => {
    act(() => {
      render(<UserIsLendingPage />);
    });

    const message = screen.getByText(/please connect your wallet/i);

    expect(message).toBeInTheDocument();
  });
});
