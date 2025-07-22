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

import { requestOptionsWithBody } from "@teamspace-app/data-access-common-api-util";
import {
  RequestMethod,
  dataNotRecievedError,
  notPostError,
} from "@teamspace-app/shared/data-access/data-access-common-api-util";
import { getOrgUrl } from "@teamspace-app/shared/util/util-application-config-util";

/**
 * backend API call to create a user
 *
 * @param req - request
 * @param res - response
 *
 * @returns correct data if the call is successful, else an error message
 */
export default async function addUser(req, res) {
  if (req.method !== "POST") {
    notPostError(res);
  }

  const body = JSON.parse(req.body);
  const accessToken = body.accessToken;
  const session = body.session;
  const orgId = body.orgId;
  const user = body.param;

  try {
    const fetchData = await fetch(
      `${getOrgUrl(orgId)}/scim2/Users`,
      session
        ? requestOptionsWithBody(session, RequestMethod.POST, user)
        : {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/scim+json",
            },
            body: JSON.stringify({
              emails: [{ primary: true, value: user.email }],
              name: { familyName: user.lastName, givenName: user.firstName },
              password: user.password,
              userName: `DEFAULT/${user.email}`,
            }),
          }
    );

    const data = await fetchData.json();

    if (!fetchData.ok) {
      return res.status(fetchData.status).json(data);
    }

    res.status(fetchData.status).json(data);
  } catch (err) {
    return dataNotRecievedError(res);
  }
}
