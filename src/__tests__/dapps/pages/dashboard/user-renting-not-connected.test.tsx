import { render, screen } from "@testing-library/react";
import UserIsRentingPage from "renft-front/pages/dashboard/renting";

jest.mock("next/router", () => {
  return {
    useRouter: jest.fn().mockReturnValue({ pathname: "/dashboard/lending" }),
  };
});

xdescribe("User is Renting page wallet is not connected", () => {
  it("shows connect message", async () => {
    render(<UserIsRentingPage />);

    const message = screen.getByText(/please connect your wallet/i);

    expect(message).toBeInTheDocument();
  });
});
