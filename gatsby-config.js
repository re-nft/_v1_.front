require("dotenv").config();

module.exports = {
  siteMetadata: {
    siteName: 'Rent NFT',
  },
  plugins: [
    'gatsby-plugin-sass',
    'gatsby-plugin-react-helmet',
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    // {
    //   resolve: `gatsby-source-filesystem`,
    //   options: {
    //     name: `src`,
    //     path: `${__dirname}/src/`,
    //   },
    // },
    // to pull nfts
    {
      resolve: "gatsby-source-custom-api",
      options: {
          url: "https://api.opensea.io/api/v1/assets?owner=0x465DCa9995D6c2a81A9Be80fBCeD5a770dEE3daE&order_direction=desc&offset=0&limit=5"
      },
      imageKeys: ["assets.image_original_url"]
    },
    // to resolve the imageurls from above to images
    // {
    //   resolve: `gatsby-plugin-remote-images`,
    //   options: {
    //     nodeType: 'CustomApi',
    //     imagePath: 'assets.image_original_url',
    //   },
    // },
    // {
      // resolve: `gatsby-source-datocms`,
      // options: { apiToken: process.env.DATO_API_TOKEN },
    // },
    {
      resolve: 'gatsby-plugin-snipcart',
      options: {
        apiKey: 'OWE3MmZmMjQtNTk3Yi00OThhLWEwMmUtZDY4ZWM4NzIwYzZiNjM2NjM0Mzc1NzE0MTUwNzI1',
        autopop: true
      }
    },
  ],
}
