import { render, screen, waitFor } from "@testing-library/react";
import LendPage from "renft-front/pages/lend";

jest.mock("next/router", () => {
  return {
    useRouter: jest.fn().mockReturnValue({
      pathname: "/lend",
      events: { on: jest.fn(), off: jest.fn() },
    }),
  };
});

describe("Lend page wallet is not connected", () => {
  it("shows connect message", async () => {
    render(<LendPage />);

    await waitFor(() => {
      const message = screen.getByText(/please connect your wallet/i);

      expect(message).toBeInTheDocument();
    });
  });
});
