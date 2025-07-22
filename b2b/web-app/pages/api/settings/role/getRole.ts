/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { requestOptions } from "@teamspace-app/data-access-common-api-util";
import { dataNotRecievedError, notPostError } 
    from "@teamspace-app/shared/data-access/data-access-common-api-util";
import { getOrgUrl } from "@teamspace-app/shared/util/util-application-config-util";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getRole(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        notPostError(res);
    }

    const body = JSON.parse(req.body);
    const session = body.session;
    const accessToken = body.accessToken;
    const orgId: string = req.query.orgId.toString();
    const roleId: string = req.query.roleId?.toString();
    const adminRoleName: string = req.query.adminRoleName?.toString();
    const roleAudienceValue: string = req.query.roleAudienceValue?.toString();

    let url = `${getOrgUrl(orgId)}/scim2/v2/Roles`;

    if (roleId) {
        url += `/${roleId}`;
    } else if (adminRoleName && roleAudienceValue) {
        url += `?filter=displayName eq ${adminRoleName} and audience.value eq ${roleAudienceValue}`;
    }

    try {
        const fetchData = await fetch(url, session ? requestOptions(session) : {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });
        const data = await fetchData.json();

        if (!fetchData.ok) {
            console.log("errorData", data)
            return res.status(fetchData.status).json(data);
          }
          
          res.status(fetchData.status).json(data);

        // res.status(200).json(data);
    } catch (err) {

        return dataNotRecievedError(res);
    }
}
