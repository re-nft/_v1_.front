# Snipcart + Gatsby + DatoCMS example

This is a demo project to get you started with a static ecommerce site powered by [Gatsby](https://www.gatsbyjs.org/), [Snipcart](https://snipcart.com/) and [DatoCMS](https://www.datocms.com/).

It's a brutalist socks ecommerce site, that looks like this:

![Socks ecommerce screenshot](./preview.png)

You can see how it looks live on this [demo installation](https://datocms-snipcart-gatsby-demo.netlify.com/).

All the details on how this works on the [related blog post](https://www.datocms.com/blog/static-ecommerce-website-snipcart-gatsbyjs-datocms).

## Deploy on DatoCMS

If you want to set up a live demo for yourself, just [sign up for a free DatoCMS account](https://dashboard.datocms.com/signup) and click this button:

[![Deploy with DatoCMS](https://dashboard.datocms.com/deploy/button.svg)](https://dashboard.datocms.com/deploy?repo=datocms/snipcart-gatsby-demo)

## Usage

To run this project locally, install the dependencies of this project:

```
yarn install
```

Add an `.env` file containing the read-only API token of your DatoCMS site (set up with the demo button above):

```
echo 'DATO_API_TOKEN=abc123' >> .env
```

Then, to run this website in development mode (with live-reload):

```
yarn develop
```

To build the final, production ready static website:

```
yarn build
```

The final result will be saved in the `public` directory.

## Further demo options

This project is also available as a demo on [Gatsby Cloud](https://www.gatsbyjs.com/). This will allow you to test the [Gatsby preview](https://www.datocms.com/blog/live-preview-changes-on-gatsby-preview) capabilities in no time.
