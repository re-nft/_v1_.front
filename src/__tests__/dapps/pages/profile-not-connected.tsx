import { render, screen, waitFor } from "@testing-library/react";
import ProfilePage from "renft-front/pages/profile";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");
jest.mock("next/router");
beforeAll(() => {
  jest.resetModules();
  jest.spyOn(console, "error").mockImplementation();
  jest.spyOn(console, "warn").mockImplementation();
  jest.spyOn(console, "log").mockImplementation();
});

afterAll(() => {
  console.error.mockRestore();
  console.log.mockRestore();
  console.warn.mockRestore();
});

describe("Profile page wallet is not connected", () => {
  beforeEach(() => {
    console.log.mockReset();
    console.warn.mockReset();
    console.error.mockReset();
  });
  afterEach(() => {
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
  });

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
