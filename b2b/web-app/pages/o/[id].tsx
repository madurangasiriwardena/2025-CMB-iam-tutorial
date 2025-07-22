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

import { 
    BrandingPreference 
} from "@teamspace-app/data-access-common-models-util";
import { orgSignin, redirect } from "@teamspace-app/shared/util/util-authorization-config-util";
import { postMeeting } from "../../APICalls/ScheduleMeeting/post-meeting";
import { getMeeting } from "../../APICalls/getMeetings/get-meeting";
import { getPersonalization } from "../../APICalls/GetPersonalization/get-personalization";
import { postPersonalization } from "../../APICalls/UpdatePersonalization/post-personalization";
import personalize from "../../components/sections/sections/settingsSection/personalizationSection/personalize";
import { MeetingInfo } from "../../types/meeting";
import { Personalization } from "../../types/personalization";
import { controllerDecodeGetBrandingPrefrence } from "@teamspace-app/data-access-controller";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { useEffect } from "react";
import Home from "../../components/sections/home";

export async function getServerSideProps(context) {

    const routerQuery = context.query.id;
    const session = await getSession(context);

    if (session === null || session === undefined|| session.error) {

        return {
            props: { routerQuery }
        };
    } else {
        if (routerQuery !== session.orgId) {

            return redirect("/404");
        } else {

            return {
                props: { session }
            };
        }

    }

}

interface OrgProps {
    session: Session
    routerQuery: string
}

/**
 * 
 * @param prop - session, routerQuery (orgId)
 * 
 * @returns Organization distinct interace
 */
export default function Org(props : OrgProps) {

    const { session, routerQuery } = props;

    useEffect(() => {
        if (routerQuery) {
            orgSignin(true,routerQuery);

            return;
        }
    }, [ routerQuery ]);

    useEffect(() => {
        
        getPersonalization(session.orgId)
            .then((response) => {
                personalize(response.data);
            })
            .catch(async (err) => {
                if (err.response?.status === 404 && session.group === "admin") {
                    const res: BrandingPreference = 
                        (await controllerDecodeGetBrandingPrefrence(session) as BrandingPreference);
                    const activeTheme: string = res["preference"]["theme"]["activeTheme"];

                    const newPersonalization: Personalization = {
                        faviconUrl: res["preference"]["theme"][activeTheme]["images"]["favicon"]["imgURL"],
                        logoAltText: res["preference"]["theme"][activeTheme]["images"]["logo"]["altText"],
                        logoUrl: res["preference"]["theme"][activeTheme]["images"]["logo"]["imgURL"],
                        org: session.orgId,
                        primaryColor: res["preference"]["theme"][activeTheme]["colors"]["primary"]["main"],
                        secondaryColor: res["preference"]["theme"][activeTheme]["colors"]["secondary"]["main"]
                    };
    
                    postPersonalization(session.accessToken, newPersonalization);
                }
            });
    }, [ session ]);

    return (
        session
            ? (<Home
                name={ session.orgName }
                session={ session }/>)
            : null
    );
}
