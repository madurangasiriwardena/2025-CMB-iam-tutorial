import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getConfig } from "@teamspace-app/util-application-config-util";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orgId } = req.query;

  try {
    const personalizationServiceUrl = getConfig().BusinessAdminAppConfig.resourceServerURLs.personalizationService;
    const apiKey = getConfig().BusinessAdminAppConfig.resourceServerURLs.apiKey;
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers["api-key"] = apiKey;
    }
    const response = await axios.get(`${personalizationServiceUrl}/personalization/${orgId}`, {
      headers
    });
    return res.status(200).json(response.data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch personalization data" });
  }
}
