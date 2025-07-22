import type { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from "@teamspace-app/util-application-config-util";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const body = JSON.parse(req.body);

    const name = body.name;
    const accessToken = body.accessToken

    if (!name) {
        return res.status(400).json({ error: 'Organization name is required' });
    }

    try {
        const response = await fetch(`${getConfig().CommonConfig.AuthorizationConfig.BaseOrganizationUrl}/api/server/v1/organizations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json(errorData);
        }

        const data = await response.json();
        return res.status(201).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
