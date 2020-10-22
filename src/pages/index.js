import React from 'react'
import { StaticQuery, graphql } from 'gatsby'
import { Box } from "@material-ui/core"
import ShadowScrollbars from "../components/ShadowScrollbars"
import Layout from "../layouts/index"

    // query={graphql`
    //   query CatalogueQuery {
    //     products: allDatoCmsProduct {
    //       edges {
    //         node {
    //           id
    //           basename
    //           price
    //           image {
    //             url
    //             sizes(maxWidth: 300, imgixParams: { fm: "jpg" }) {
    //               ...GatsbyDatoCmsSizes
    //             }
    //           }
    //         }
    //       }
    //     }
    //     site {
    //       siteMetadata {
    //         siteName
    //       }
    //     }
    //   }
    // `}

export default () => (
  <StaticQuery
    query={graphql`
      query CatalogueQuery {
        allCustomApi {
          edges {
            node {
              assets {
                asset_contract {
                  address
                  asset_contract_type
                  created_date(fromNow: true)
                  description
                }
                token_id
                image_original_url
              }
            }
          }
        }
        site {
          siteMetadata {
            siteName
          }
        }
      }
    `}
    render={data => (
      <>
        <Layout site={data.site}>
            <ShadowScrollbars style={{ height: 800 }}>
          <Box className="gradient-box" style={{ padding: '32px 64px', border: "3px solid black" }}>
            <ul class="c-rainbow">
              <li class="c-rainbow__layer c-rainbow__layer--white">SCROLL FOR MORE</li>
              <li class="c-rainbow__layer c-rainbow__layer--orange">SCROLL FOR MORE</li>
              <li class="c-rainbow__layer c-rainbow__layer--red">SCROLL FOR MORE</li>
              <li class="c-rainbow__layer c-rainbow__layer--violet">SCROLL FOR MORE</li>
              <li class="c-rainbow__layer c-rainbow__layer--blue">SCROLL FOR MORE</li>
              <li class="c-rainbow__layer c-rainbow__layer--green">SCROLL FOR MORE</li>
              <li class="c-rainbow__layer c-rainbow__layer--yellow">SCROLL FOR MORE</li>
            </ul>
            <div className="Catalogue">

              {data.allCustomApi.edges[0].node.assets.map((product) => {
                return (<div className="Catalogue__item" key={product.token_id}>
                  <div
                    className="Product snipcart-add-item"
                    data-item-id={product.token_id}
                    data-item-price='10'
                    data-item-image={product.image_url}
                    data-item-name="a"
                    data-item-url={`/`}
                  >
                    <div className="Product__image">
                        <img src={product.image_original_url} />
                      {/* <Img key={product.token_id} fluid /> */}
                      {/* <Img sizes={product.image.sizes} /> */}
                    </div>
                    <div className="Product__details">
                      <div className="Product__name">
                        {/* {product.asset_contract.address} */}
                        <div className="Product__price">
                          10 €
                        </div>
                      </div>
                      <span className="Product__buy">Rent now</span>
                    </div>
                  </div>
              </div>)})
              }
          </div>

            </Box>
            </ShadowScrollbars>
        </Layout>
      </>
      )}
  />
  );
