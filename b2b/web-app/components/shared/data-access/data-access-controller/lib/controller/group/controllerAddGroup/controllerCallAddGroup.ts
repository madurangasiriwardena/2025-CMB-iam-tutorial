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

import { commonControllerCall } from "@teamspace-app/shared/data-access/data-access-common-api-util";
import { AddedGroup, SendGroup } from "@teamspace-app/shared/data-access/data-access-common-models-util";
import { Session } from "next-auth";

/**
 * call POST `getManagementAPIServerBaseUrl()/o/<subOrgId>/scim2/Users` create the user
 * 
 * @param session - session object
 * @param group - `SendGroup`
 * 
 * @returns created group details, if not created returns `null`
 */
export async function controllerCallAddGroup(session: Session, group: SendGroup): Promise<AddedGroup | null> {

    const data = (await commonControllerCall("/api/settings/group/addGroup", session, group) as AddedGroup | null);

    return data;

}
