// import React from "react";
// import { render, screen, waitFor } from "@testing-library/react";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");

describe("Rent form", () => {
  it("should not allow submit when form invalid", () => {
    expect(true).toBe(false);
  });
  it("should not allow submit when paymentokens are not approved", () => {
    expect(true).toBe(false);
  });
  it("should not allow submit when paymentokens are approved but not enough", () => {
    expect(true).toBe(false);
  });
  it("should allow removing items", () => {
    expect(true).toBe(false);
  });
  it("should show empty message when everything removed", () => {
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
  describe("should not allow invalid values", () => {
    it("invalid value state", () => {
      expect(true).toBe(false);
    });
  });
});
