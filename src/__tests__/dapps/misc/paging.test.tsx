import { renderHook, waitFor } from "@testing-library/react-hooks";
import { useWallet } from "renft-front/hooks/store/useWallet";

xdescribe("Paging", () => {
  it("should page count", () => {
    expect(true).toBe(false);
  });
  it("previous button should be disabled when on first page", () => {
    expect(true).toBe(false);
  });
  it("next button should be disabled when on last page", () => {
    expect(true).toBe(false);
  });
  it("got to first page button should be disabled when on first page", () => {
    expect(true).toBe(false);
  });
  it("go to last page should be disabled when on last page", () => {
    expect(true).toBe(false);
  });

  it("should not rerender when the same page selected as current", () => {
    expect(true).toBe(false);
  });
  it("should not show paging for less than PAGE_COUNT", () => {
    expect(true).toBe(false);
  });
  it("should remember page position when navigated to different section", () => {
    expect(true).toBe(false);
  });
  it("should remember search when navigated to different section", () => {
    expect(true).toBe(false);
  });
  it("should remember filter when navigated to different section", () => {
    expect(true).toBe(false);
  });
});
