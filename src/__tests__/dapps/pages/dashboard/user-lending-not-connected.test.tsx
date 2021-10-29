import { render, screen } from "@testing-library/react";
import UserIsLendingPage from "renft-front/pages/dashboard/lending";

jest.mock("next/router", () => {
  return {
    useRouter: jest.fn().mockReturnValue({ pathname: "/dashboard/lending" }),
  };
});

xdescribe("User Lending page wallet is not connected", () => {
  it("shows connect message", async () => {
    render(<UserIsLendingPage />);

    const message = screen.getByText(/please connect your wallet/i);

    expect(message).toBeInTheDocument();
  });
});
