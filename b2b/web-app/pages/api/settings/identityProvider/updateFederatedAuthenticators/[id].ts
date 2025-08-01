/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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

import { requestOptionsWithBody } 
    from "@teamspace-app/data-access-common-api-util";
import { RequestMethod, dataNotRecievedError, notPostError } from
    "@teamspace-app/shared/data-access/data-access-common-api-util";
import { getOrgUrl } from "@teamspace-app/shared/util/util-application-config-util";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * backend API call to update federtated authenticators of an identity provider
 * 
 * @param req - request
 * @param res - response
 * 
 * @returns correct data if the call is successful, else an error message
 */
export default async function updateFederatedAuthenticators(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        notPostError(res);
    }

    const body = JSON.parse(req.body);
    const session = body.session;
    const orgId = body.orgId;
    const request = body.param;

    const idpId = req.query.id;

    const url = `${getOrgUrl(orgId)}/api/server/v1/identity-providers/${idpId}` +
        `/federated-authenticators/${request[0]}`;

    try {
        const fetchData = await fetch(
            url,
            requestOptionsWithBody(session, RequestMethod.PUT, request[1])
        );
        const data = await fetchData.json();

        res.status(200).json(data);
    } catch (err) {

        return dataNotRecievedError(res);
    }
}
