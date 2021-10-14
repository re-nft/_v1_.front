// import React from "react";
// import { render, screen, waitFor } from "@testing-library/react";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");

describe("Lend form", () => {
  it("should not allow submit when form invalid", () => {
    expect(true).toBe(false);
  });
  it("should not allow submit when one nft is not approved", () => {
    expect(true).toBe(false);
  });
  it("should show validation message for each invalid field ", () => {
    expect(true).toBe(false);
  });
  it("should restore previous saved state", () => {
    expect(true).toBe(false);
  });
  it("should save state on form change", () => {
    expect(true).toBe(false);
  });
  it("should allow removing items", () => {
    expect(true).toBe(false);
  });
  it("should show empty message when everything removed", () => {
    expect(true).toBe(false);
  });
  describe("invalid states", () => {
    it("should not allow non-allowed values (to be defined)", () => {
      expect(true).toBe(false);
    });
  });
});
