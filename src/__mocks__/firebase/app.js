module.exports = {
    auth: jest.fn().mockReturnThis(),
    apps: [],
    initializeApp: jest.fn(),
    database: jest.fn().mockReturnValue({
        ref: jest.fn().mockReturnValue({
            once: jest.fn().mockReturnValue(Promise.resolve(
                {
                    val: jest.fn().mockReturnValue("some data")
                }
            ))
        })
    }),
}
