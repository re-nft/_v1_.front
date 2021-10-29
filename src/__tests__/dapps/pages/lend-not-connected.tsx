import { render, screen, waitFor } from "@testing-library/react";
import LendPage from "renft-front/pages/lend";

describe("Lend page wallet is not connected", () => {
  it("shows connect message", async () => {
    render(<LendPage />);

    await waitFor(() => {
      const message = screen.getByText(/please connect your wallet/i);

      expect(message).toBeInTheDocument();
    });
  });
});
