require("dotenv").config();

module.exports = {
  siteMetadata: {
    siteName: "Rent NFT"
  },
  plugins: [
    {
      resolve: `gatsby-plugin-sass`
    },
    {
      resolve: `gatsby-plugin-react-helmet`
    },
    {
      resolve: `gatsby-plugin-offline`
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        icon: `src/images/favicon.ico`
      }
    }
  ]
};
