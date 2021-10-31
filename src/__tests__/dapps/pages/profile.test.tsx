jest.mock("next/router", () => {
  return {
    useRouter: jest.fn().mockReturnValue({
      pathname: "/profile",
      events: { on: jest.fn(), off: jest.fn() },
    }),
  };
});

xdescribe("profile", () => {
  it("", () => {
    expect(true).toBe(false);
  });
});
