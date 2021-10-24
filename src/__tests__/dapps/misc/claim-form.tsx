// import React from "react";
// import { render, screen, waitFor } from "@testing-library/react";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");

describe("Claim form", () => {
  it("should show items to be claimed", () => {
    expect(true).toBe(false);
  });
  it("should show claim button", () => {
    expect(true).toBe(false);
  });
  it("should not show items already claimed before", () => {
    expect(true).toBe(false);
  });
});
