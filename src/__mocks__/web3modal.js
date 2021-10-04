
module.exports = jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockReturnValue(Promise.resolve({}))
}))