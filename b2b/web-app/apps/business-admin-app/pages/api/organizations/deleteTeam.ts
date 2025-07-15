import type { NextApiRequest, NextApiResponse } from 'next';
import { getConfig } from "@pet-management-webapp/util-application-config-util";

/**
 * API route to delete an organization
 * 
 * @param req - NextApiRequest containing orgId and accessToken
 * @param res - NextApiResponse
 * @returns Success or error response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orgId, accessToken } = req.body;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    if (!accessToken) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    const response = await fetch(
      `${getConfig().CommonConfig.AuthorizationConfig.BaseOrganizationUrl}/api/server/v1/organizations/${orgId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    if (response.status === 204 || response.status === 400 || response.ok) {

        return res.status(200).json({ 
        success: true, 
        message: 'Organization deleted successfully' 
      });
    }

    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }

    return res.status(response.status).json({ 
      error: errorData.detail || errorData.message || 'Failed to delete organization',
      code: response.status,
      details: errorData
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return res.status(500).json({ 
      error: 'An unexpected error occurred while deleting the organization',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}