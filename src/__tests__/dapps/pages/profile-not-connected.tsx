import { render, screen, waitFor } from "@testing-library/react";
import ProfilePage from "renft-front/pages/profile";

jest.mock("next/router", () => {
  return {
    useRouter: jest.fn().mockReturnValue({
      pathname: "/profile",
      events: { on: jest.fn(), off: jest.fn() },
    }),
  };
});

describe("Profile page wallet is not connected", () => {
  it("shows connect message", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      const message = screen.getByText(/please connect your wallet/i);

      expect(message).toBeInTheDocument();
    });
  });
});
