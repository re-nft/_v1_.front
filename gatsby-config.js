require(`dotenv`).config();

module.exports = {
  siteMetadata: {
    siteName: `Rent NFT`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-sass`,
    },
    {
      resolve: `gatsby-plugin-react-helmet`,
    },
    {
      resolve: `gatsby-plugin-offline`,
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        icon: `src/images/favicon.ico`,
      },
    },
    {
      resolve: `gatsby-source-custom-api`,
      options: {
        url: `https://api.opensea.io/api/v1/assets?owner=0x465DCa9995D6c2a81A9Be80fBCeD5a770dEE3daE&order_direction=desc&offset=0`,
      },
      imageKeys: [`assets.image_original_url`],
    },
    {
      resolve: `gatsby-plugin-snipcart`,
      options: {
        apiKey: `OWE3MmZmMjQtNTk3Yi00OThhLWEwMmUtZDY4ZWM4NzIwYzZiNjM2NjM0Mzc1NzE0MTUwNzI1`,
        autopop: true,
      },
    },
  ],
};
