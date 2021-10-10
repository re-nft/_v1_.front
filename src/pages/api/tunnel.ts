import { NextApiRequest, NextApiResponse } from "next";


const sentryHost = "sentry.io";

// Set knownProjectIds to an array with your Sentry project IDs which you
// want to accept through this proxy.
const knownProjectIds: string[] = ["5984702"];

const handler = async (req:NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    const envelope = req.body;
    const pieces = envelope.split("\n");

    const header = JSON.parse(pieces[0]);
    if(!header.dsn) throw new Error("No dsn value provided")
    const parsedUrl = new URL(header.dsn);
    const { host, pathname } = parsedUrl;
    if (!host?.includes(sentryHost)) {
      throw new Error(`invalid host: ${host}`);
    }

    const projectId =
      pathname && pathname.startsWith("/")
        ? pathname.slice(1, pathname.length)
        : pathname || "";
    if (!knownProjectIds.includes(projectId)) {
      throw new Error(`invalid project id: ${projectId}`);
    }

    const endpoint = `https://${sentryHost}/api/${projectId}/envelope/`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-type": "application/x-sentry-envelope"
      },
      body: envelope
    });
    return response.json();
  } catch (e) {
    //captureException(e);
    return res.status(400).json({ status: "invalid request" });
  }
};

export default handler;
