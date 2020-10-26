export const pinToIpfs = async ({ blob }) => {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  try {
    let data = new FormData();
    data.append("file", blob);
    // const metadata = JSON.stringify({
    // name: `${artMeta.artName}`,
    // keyvalues: {
    //   wildcards: "art",
    // userName: `${profile.name}`,
    // proofDid: `${profile.proof_did}`,
    // artName: `${artMeta.artName}`,
    // authorComment: `${artMeta.authorComment}`,
    // fileName: `${file.name}`,
    // animalID: `${artMeta.animalID}`,
    // status: IN_REVIEW,
    // },
    // });
    // data.append("pinataMetadata", metadata);
    const pinataOptions = JSON.stringify({
      cidVersion: 0,
      customPinPolicy: {
        regions: [
          {
            id: "FRA1",
            desiredReplicationCount: 1,
          },
          // {
          //   id: "NYC1",
          //   desiredReplicationCount: 2,
          // },
        ],
      },
    });
    data.append("pinataOptions", pinataOptions);
    const headers = {
      pinata_api_key: process.env.GATSBY_PINATA_API_KEY,
      pinata_secret_api_key: process.env.GATSBY_PINATA_SECRET_API_KEY,
    };
    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: data,
    });
    // const resp = await axios.post(url, data, { headers });
    return resp;
  } catch (error) {
    console.error("captured pinning to IPFS with Pinata error", error);
  }
  return null;
};
