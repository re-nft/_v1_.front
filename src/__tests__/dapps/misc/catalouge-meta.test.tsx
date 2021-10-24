import { render, waitFor, act, screen } from "@testing-library/react";
import { useNftsStore } from "renft-front/hooks/store/useNftStore";
import { useNftMetaState } from "renft-front/hooks/store/useMetaState";
import { Nft } from "renft-front/types/classes";

import { useEventTrackedTransactionState } from "renft-front/hooks/store/useEventTrackedTransactions";
import { ASTROCAT_CONTRACT_ADDRESS } from "renft-front/consts";

import { enableMapSet } from "immer";
import { CatalogueItem } from "renft-front/components/catalogue-item";
import { useWallet } from "renft-front/hooks/store/useWallet";
import { TransactionStateEnum } from "renft-front/types";

enableMapSet();

jest.mock("zustand");
jest.mock("firebase/app");
jest.mock("react-ga");
jest.mock("@ethersproject/providers");
jest.mock("web3modal");
jest.mock("renft-front/hooks/store/useWallet", () => {
  return {
    __esModule: true,
    useWallet: jest.fn().mockReturnValue({
      signer: "dummy signer",
    }),
  };
});
jest.mock("renft-front/hooks/store/useNftStore", () => {
  return {
    __esModule: true,
    useNftsStore: jest.fn().mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {},
      };
      return fn(state);
    }),
  };
});
jest.mock("renft-front/hooks/store/useMetaState", () => {
  return {
    __esModule: true,
    useNftMetaState: jest.fn().mockImplementation((fn) => {
      const state = {
        metas: [],
      };
      return fn(state);
    }),
  };
});

jest.mock("renft-front/hooks/store/useEventTrackedTransactions", () => {
  return {
    __esModule: true,
    useEventTrackedTransactionState: jest.fn().mockImplementation((fn) => {
      const state = {
        uiPendingTransactionState: {},
      };
      return fn(state);
    }),
  };
});
jest.mock("video-react", () => {
  return {
    __esModule: true,
    Player: jest.fn().mockImplementation(() => {
      return <div>Player</div>;
    }),
  };
});
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation();
  jest.spyOn(console, "warn").mockImplementation();
  jest.spyOn(console, "log").mockImplementation();
});
afterAll(() => {
  console.error.mockRestore();
  console.log.mockRestore();
  console.warn.mockRestore();
});

describe("Catalouge item", () => {
  beforeEach(() => {
    console.log.mockReset();
    console.warn.mockReset();
    console.error.mockReset();
  });
  afterEach(() => {
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("should show loading skeleton when nft is not found", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: false,
      onCheckboxChange: jest.fn(),
      disabled: false,
      show: true,
      uniqueId: "some unique id",
    };
    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-skeleton")).toBeInTheDocument();
  });

  it("should show loading skeleton when image is loading", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: false,
      onCheckboxChange: jest.fn(),
      disabled: false,
      show: true,
      uniqueId: "some unique id",
    };
    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: { loading: true },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-skeleton")).toBeInTheDocument();
  });

  it("should show component details when image is loaded", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: false,
      onCheckboxChange: jest.fn(),
      disabled: false,
      show: true,
      uniqueId: "some unique id",
    };
    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: { loading: false },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
  });

  it("should show image", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: false,
      onCheckboxChange: jest.fn(),
      disabled: false,
      show: true,
      uniqueId: "some unique id",
    };
    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: { loading: false, image: "somimage.png" },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
    expect(screen.getByTestId("catalogue-item-img")).toHaveAttribute(
      "src",
      "somimage.png"
    );
  });
  it("should show video", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: false,
      onCheckboxChange: jest.fn(),
      disabled: false,
      show: true,
      uniqueId: "some unique id",
    };
    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: { loading: false, image: "somimage.mp4" },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("catalogue-item-player")).toBeInTheDocument();
    });
  });
  it("should show no img default", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: false,
      onCheckboxChange: jest.fn(),
      disabled: false,
      show: true,
      uniqueId: "some unique id",
    };
    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: { loading: false, image: "" },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
    expect(screen.getByText("NO IMG")).toBeInTheDocument();
  });

  it("should show opensea link", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: false,
      onCheckboxChange: jest.fn(),
      disabled: false,
      show: true,
      uniqueId: "some unique id",
    };
    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: {
            loading: false,
            image: "",
            openseaLink: "dummy link",
          },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
    expect(screen.getByLabelText("opensea link")).toHaveAttribute(
      "href",
      "dummy link"
    );
  });
  it("should show rarible link", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: false,
      onCheckboxChange: jest.fn(),
      disabled: false,
      show: true,
      uniqueId: "some unique id",
    };
    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: {
            loading: false,
            image: "",
            openseaLink: "dummy link",
          },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
    expect(screen.getByLabelText("rarible link")).toHaveAttribute(
      "href",
      "https://rarible.com/token/contractaddress:tokenid"
    );
  });

  it("should show verified", async () => {
    const props = {
      nId: `${ASTROCAT_CONTRACT_ADDRESS}::tokenid::0`,
      checked: false,
      onCheckboxChange: jest.fn(),
      disabled: false,
      show: true,
      uniqueId: "some unique id",
    };
    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft(
            ASTROCAT_CONTRACT_ADDRESS,
            "tokenid",
            false
          ),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: {
            loading: false,
            image: "",
            openseaLink: "dummy link",
          },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
    expect(screen.getByLabelText("verified")).toBeInTheDocument();
  });
  it("should show not show verified status", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: false,
      onCheckboxChange: jest.fn(),
      disabled: false,
      show: true,
      uniqueId: "some unique id",
    };
    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: {
            loading: false,
            image: "",
            openseaLink: "dummy link",
          },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
    expect(screen.queryByLabelText("verified")).not.toBeInTheDocument();
  });
  it("should show copy link ", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: false,
      onCheckboxChange: jest.fn(),
      disabled: false,
      show: true,
      uniqueId: "some unique id",
    };
    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: {
            loading: false,
            image: "",
            openseaLink: "dummy link",
          },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
    expect(screen.queryByLabelText("copy")).toBeInTheDocument();
  });

  it("button should be disabled when no wallet", async () => {
    useWallet.mockReturnValue({
      signer: null,
    });

    const props = {
      nId: "contractaddress::tokenid::0",
      checked: false,
      onCheckboxChange: jest.fn(),
      disabled: false,
      show: true,
      uniqueId: "some unique id",
      hasAction: true,
      buttonTitle: "Click here",
    };
    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: {
            loading: false,
            image: "",
            openseaLink: "dummy link",
          },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
    expect(screen.queryByLabelText(props.buttonTitle)).toBeDisabled();
  });

  it("button should be disabled when not selected", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: false,
      onCheckboxChange: jest.fn(),
      disabled: false,
      show: true,
      uniqueId: "some unique id",
      hasAction: true,
      buttonTitle: "Click here",
    };
    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: {
            loading: false,
            image: "",
            openseaLink: "dummy link",
          },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
    expect(screen.queryByLabelText(props.buttonTitle)).toBeDisabled();
  });

  it("button should be disabled when disabled by parent component but was checked before", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: true,
      onCheckboxChange: jest.fn(),
      disabled: true,
      show: true,
      uniqueId: "some unique id",
      hasAction: true,
      buttonTitle: "Click here",
    };
    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: {
            loading: false,
            image: "",
            openseaLink: "dummy link",
          },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
    expect(screen.queryByLabelText(props.buttonTitle)).toBeDisabled();
  });

  it("should show pending transaction status", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: true,
      onCheckboxChange: jest.fn(),
      disabled: true,
      show: true,
      uniqueId: "some unique id",
      hasAction: true,
      buttonTitle: "Click here",
    };
    useEventTrackedTransactionState.mockImplementation((fn) => {
      const state = {
        uiPendingTransactionState: {
          [`${props.uniqueId}`]: TransactionStateEnum.PENDING,
        },
      };
      return fn(state);
    });

    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: {
            loading: false,
            image: "",
            openseaLink: "dummy link",
          },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
    expect(screen.getByLabelText("transaction-status-loader")).toHaveAttribute(
      "src",
      "/assets/loading-pending.gif"
    );
  });
  it("should show success transaction status", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: true,
      onCheckboxChange: jest.fn(),
      disabled: true,
      show: true,
      uniqueId: "some unique id",
      hasAction: true,
      buttonTitle: "Click here",
    };
    useEventTrackedTransactionState.mockImplementation((fn) => {
      const state = {
        uiPendingTransactionState: {
          [`${props.uniqueId}`]: TransactionStateEnum.SUCCESS,
        },
      };
      return fn(state);
    });

    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: {
            loading: false,
            image: "",
            openseaLink: "dummy link",
          },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
    expect(screen.getByLabelText("transaction-status-loader")).toHaveAttribute(
      "src",
      "/assets/loading-success.png"
    );
  });
  it("should show failed transaction status", async () => {
    const props = {
      nId: "contractaddress::tokenid::0",
      checked: true,
      onCheckboxChange: jest.fn(),
      disabled: true,
      show: true,
      uniqueId: "some unique id",
      hasAction: true,
      buttonTitle: "Click here",
    };
    useEventTrackedTransactionState.mockImplementation((fn) => {
      const state = {
        uiPendingTransactionState: {
          [`${props.uniqueId}`]: TransactionStateEnum.FAILED,
        },
      };
      return fn(state);
    });

    useNftsStore.mockImplementation((fn) => {
      const state = {
        amounts: new Map(),
        nfts: {
          [`${props.nId}`]: new Nft("contractaddress", "tokenid", false),
        },
      };
      return fn(state);
    });
    useNftMetaState.mockImplementation((fn) => {
      const state = {
        metas: {
          [`${props.nId}`]: {
            loading: false,
            image: "",
            openseaLink: "dummy link",
          },
        },
      };
      return fn(state);
    });

    await act(async () => render(<CatalogueItem {...props} />));
    expect(screen.getByTestId("catalogue-item-loaded")).toBeInTheDocument();
    expect(screen.getByLabelText("transaction-status-loader")).toHaveAttribute(
      "src",
      "/assets/loading-failed.png"
    );
  });
});
