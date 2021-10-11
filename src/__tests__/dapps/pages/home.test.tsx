import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("firebase/app");
jest.mock("react-ga");

import Home from "renft-front/pages/index";

describe("Home", () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  it("renders empty rentals", () => {
    render(<Home />);

    const message = screen.getByTestId("empty-message");

    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent(/you can't rent anything yet/i);
  });

  it("renders rentals returned by API", () => {
    render(<Home />);

    const message = screen.getByTestId("empty-message");

    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent(/you can't rent anything yet/i);
    // with disabled state
    // you cannot click
  });

  describe("when wallet connected", () => {
    it("renders clickable rental items", () => {
      //todo
    });
    it("rerenders saved form items, when form model closes", () => {
      //todo
    });
    it("rerenders saved form items, when form model closes", () => {
      //todo
    });
    it("rerenders selected rentals when page changed", () => {
      //todo
    });
  });

  describe("filter", () => {
    //todo
  });
  describe("sort", () => {
    //todo
  });
});
