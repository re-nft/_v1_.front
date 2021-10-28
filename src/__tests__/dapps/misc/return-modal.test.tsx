// import React from "react";
// import { render, screen, waitFor } from "@testing-library/react";

jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");

xdescribe("Return form", () => {
  it("should not items to be returned", () => {
    expect(true).toBe(false);
  });
  it("should show approve nft button first", () => {
    expect(true).toBe(false);
  });
  it("should not show approve nft button first when already approved", () => {
    expect(true).toBe(false);
  });
  it("should show return button when already approved", () => {
    expect(true).toBe(false);
  });
});
