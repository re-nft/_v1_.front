export const pinToIpfs = async ({ blob }) => {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  try {
    let data = new FormData();
    data.append("file", blob);
    const pinataOptions = JSON.stringify({
      cidVersion: 0,
      customPinPolicy: {
        regions: [
          {
            id: "FRA1",
            desiredReplicationCount: 1
          }
        ]
      }
    });
    data.append("pinataOptions", pinataOptions);
    const headers = {
      pinata_api_key: process.env.GATSBY_PINATA_API_KEY,
      pinata_secret_api_key: process.env.GATSBY_PINATA_SECRET_API_KEY
    };
    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: data
    });
    return resp;
  } catch (error) {
    console.error("captured pinning to IPFS with Pinata error", error);
  }
  return null;
};
