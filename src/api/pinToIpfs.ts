export const pinToIpfs = async ({ blob }) => {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  try {
    let data = new FormData();
    data.append("file", blob);
    const pinataOptions = JSON.stringify({
      cidVersion: 0,
      customPinPolicy: {
        // todo: remove france here. do auto
        regions: [
          {
            id: "FRA1",
            desiredReplicationCount: 1,
          },
        ],
      },
    });
    data.append("pinataOptions", pinataOptions);

    const pinataApiKey = process.env.GATSBY_PINATA_API_KEY;
    const pinataSecretKey = process.env.GATSBY_PINATA_SECRET_API_KEY;

    if (!pinataApiKey || !pinataSecretKey) {
      console.error("please define pinata api and secret keys (process.env)");
      return;
    }

    const headers = {
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataSecretKey,
    };

    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: data,
    });
    return resp;
  } catch (error) {
    console.debug("captured pinning to IPFS with Pinata error", error);
  }
  return null;
};
