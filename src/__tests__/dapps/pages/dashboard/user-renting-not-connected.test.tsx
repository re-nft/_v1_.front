import { render, screen, act } from "@testing-library/react";
import UserIsRentingPage from "renft-front/pages/dashboard/renting";

jest.mock("next/router", () => {
  return {
    useRouter: jest.fn().mockReturnValue({
      pathname: "/dashboard/renting",
      events: { on: jest.fn(), off: jest.fn() },
    }),
  };
});

describe("User is Renting page wallet is not connected", () => {
  it("shows connect message", async () => {
    act(() => {
      render(<UserIsRentingPage />);
    });

    const message = screen.getByText(/please connect your wallet/i);

    expect(message).toBeInTheDocument();
  });
});
