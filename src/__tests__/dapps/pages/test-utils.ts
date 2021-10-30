import { waitFor } from "@testing-library/react";
import { rest } from "msw";

const uniswapRequest = () => {
  return rest.post(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          data: {
            bundles: [
              {
                ethPriceUSD: 1,
              },
            ],
          },
        })
      );
    }
  );
};

export const mockResponse = (options) => {
  const { renftapi, openseaapi, eip1155api, eip721api } = Object.assign(
    {},
    {
      renftapi: {
        status: 200,
        json: {},
      },
      openseaapi: {
        status: 200,
        json: {},
      },
      eip721api: {
        status: 200,
        json: {},
      },
      eip1155api: {
        status: 200,
        json: {},
      },
    },
    options
  );
  return [
    rest.options(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
      return res(ctx.status(200));
    }),
    rest.post(process.env.NEXT_PUBLIC_RENFT_API, (req, res, ctx) => {
      // Respond with "500 Internal Server Error" status for this test.
      return res(ctx.status(renftapi.status), ctx.json(renftapi.json));
    }),
    rest.get(`${process.env.NEXT_PUBLIC_OPENSEA_API}`, (req, res, ctx) => {
      return res(ctx.status(openseaapi.status), ctx.json(openseaapi.json));
    }),
    rest.post(process.env.NEXT_PUBLIC_EIP721_API, (req, res, ctx) => {
      // Respond with "500 Internal Server Error" status for this test.
      return res(ctx.status(eip721api.status), ctx.json(eip721api.json));
    }),
    rest.post(process.env.NEXT_PUBLIC_EIP1155_API, (req, res, ctx) => {
      // Respond with "500 Internal Server Error" status for this test.
      return res(ctx.status(eip1155api.status), ctx.json(eip1155api.json));
    }),

    uniswapRequest(),
    // catch all for ipfs data
    rest.get("*", (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          image: null,
          description: "",
          name: "",
        })
      );
    }),
  ];
};

export const waitForRefetch = async (screen) => {
  // wait for refetch to complete
  await waitFor(() => {
    expect(screen.queryByTestId("list-loader")).toBeInTheDocument();
  });
  await waitFor(
    () => {
      expect(screen.queryByTestId("list-loader")).not.toBeInTheDocument();
    },
    { timeout: 2000 }
  );
};
