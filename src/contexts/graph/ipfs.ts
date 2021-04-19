import BufferList from "bl";
//@ts-ignore
import ipfsAPI from "ipfs-http-client";

export const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

export const getFromIPFS = async (hashToGet: string) => {
  for await (const file of ipfs.get(hashToGet)) {
    // @ts-ignore
    if (!file.content) continue;
    const content = new BufferList();
    // @ts-ignore
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    return content;
  }
};
