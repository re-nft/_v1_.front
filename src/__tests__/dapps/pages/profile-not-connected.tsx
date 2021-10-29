import { render, screen, waitFor } from "@testing-library/react";
import ProfilePage from "renft-front/pages/profile";

describe("Profile page wallet is not connected", () => {
  it("shows connect message", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      const message = screen.getByText(/please connect your wallet/i);

      expect(message).toBeInTheDocument();
    });
  });
});
