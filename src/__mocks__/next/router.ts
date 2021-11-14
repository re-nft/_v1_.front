export const useRouter = jest.fn().mockReturnValue({
  events: { on: jest.fn(), off: jest.fn() },
});
