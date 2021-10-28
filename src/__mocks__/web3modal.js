module.exports = jest.fn().mockImplementation(() => ({
  connect: jest.fn().mockResolvedValue({}),
}));
