import { render, screen } from "@testing-library/react";
import UserIsRentingPage from "renft-front/pages/dashboard/renting";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");
jest.mock("next/router", () => {
  return {
    useRouter: jest.fn().mockReturnValue({ pathname: "/dashboard/lending" }),
  };
});

describe("User is Renting page wallet is not connected", () => {
  it("shows connect message", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

    render(<UserIsRentingPage />);

    const message = screen.getByText(/please connect your wallet/i);

    expect(message).toBeInTheDocument();

    expect(spyLog).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
  });
});
