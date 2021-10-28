import { render, screen, waitFor } from "@testing-library/react";
import ProfilePage from "renft-front/pages/profile";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");

xdescribe("Profile page wallet is not connected", () => {
  it("shows connect message", async () => {
    const spyLog = jest.spyOn(global.console, "log");
    const spyWarn = jest.spyOn(global.console, "warn");

    render(<ProfilePage />);

    await waitFor(() => {
      const message = screen.getByText(/please connect your wallet/i);

      expect(message).toBeInTheDocument();

      expect(spyLog).not.toHaveBeenCalled();
      expect(spyWarn).not.toHaveBeenCalled();
    });
  });
});
