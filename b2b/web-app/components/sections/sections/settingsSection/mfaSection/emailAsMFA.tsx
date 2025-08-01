/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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
    Application, ApplicationList, checkIfAuthenticatorIsinAuthSequence
} from "@teamspace-app/data-access-common-models-util";
import {
    controllerDecodeGetApplication, controllerDecodeListCurrentApplication
} from "@teamspace-app/data-access-controller";
import { AccordianItemHeaderComponent } from "@teamspace-app/shared/ui/ui-components";
import { EMAIL, EMAIL_OTP_AUTHENTICATOR, checkIfJSONisEmpty } from "@teamspace-app/shared/util/util-common";
import {
    LOADING_DISPLAY_NONE} from "@teamspace-app/shared/util/util-front-end-util";
import { Session } from "next-auth";
import React, { useCallback, useEffect, useState } from "react";
import { Button, FlexboxGrid } from "rsuite";
import ConfirmMFAAddRemoveModal from "./confirmMFAAddRemoveModal";
import { getImageForMFAProvider } from "./mfaProviderUtils";

interface EmailAsMFAProps {
    session: Session,
    id: string
}

/**
 *
 * @param prop - session, id (idp id), fetchAllIdPs (function to fetch all Idps)
 *
 * @returns idp item details component
 */
export default function EmailAsMFA(props: EmailAsMFAProps) {

    const { session } = props;

    const [ loadingDisplay, setLoadingDisplay ] = useState(LOADING_DISPLAY_NONE);
    const [ allApplications, setAllApplications ] = useState<ApplicationList>(null);
    const [ applicationDetail, setApplicationDetail ] = useState<Application>(null);
    const [ idpIsinAuthSequence, setIdpIsinAuthSequence ] = useState<boolean>(null);
    const [ openListAppicationModal, setOpenListAppicationModal ] = useState<boolean>(false);

    const fetchData = useCallback(async () => {
        const res : ApplicationList = ( await controllerDecodeListCurrentApplication(session) as ApplicationList );

        await setAllApplications(res);
    }, [ session, openListAppicationModal ]);

    const fetchApplicatioDetails = useCallback(async () => {
        if (!checkIfJSONisEmpty(allApplications) && allApplications.totalResults !== 0) {
            const res : Application = (
                await controllerDecodeGetApplication(session, allApplications.applications[0].id) as Application );

            await setApplicationDetail(res);
        }
    }, [ session, allApplications ]);

    useEffect(() => {
        fetchData();
    }, [ fetchData ]);

    useEffect(() => {
        fetchApplicatioDetails();
    }, [ fetchApplicatioDetails ]);

    useEffect(() => {
        if (!checkIfJSONisEmpty(applicationDetail)) {
            const check = checkIfAuthenticatorIsinAuthSequence(applicationDetail, EMAIL_OTP_AUTHENTICATOR);

            setIdpIsinAuthSequence(check[0]);
        }
    }, [ applicationDetail ]);

    const onAddToLoginFlowClick = (): void => {
        setOpenListAppicationModal(true);
    };

    const onCloseListAllApplicaitonModal = (): void => {
        setOpenListAppicationModal(false);
    };

    return (
        <div style={ { margin: "50px 25px" } }>
            <FlexboxGrid align="middle">
                <FlexboxGrid.Item colspan={ 12 }>
                    <AccordianItemHeaderComponent
                        imageSrc={ getImageForMFAProvider(EMAIL) }
                        title={ "Email OTP" }
                        description={ "Configure Email as multi-factor authentication." } />
                </FlexboxGrid.Item>

                {
                    idpIsinAuthSequence === null
                        ? null
                        : idpIsinAuthSequence
                            ? (
                                <FlexboxGrid.Item colspan={ 6 }>
                                    <Button
                                        style={ { width: "125%" } }
                                        appearance="ghost"
                                        onClick={ onAddToLoginFlowClick }>
                                        Remove from Login Flow
                                    </Button>
                                </FlexboxGrid.Item>)
                            : (
                                <FlexboxGrid.Item colspan={ 6 }>
                                    <Button
                                        style={ { width: "125%", opacity:"0.9", borderRadius: "22px" } }
                                        appearance="default"
                                        onClick={ onAddToLoginFlowClick }>
                                        Add to the Login Flow
                                    </Button>
                                </FlexboxGrid.Item>)
                }
                <ConfirmMFAAddRemoveModal
                    session={ session }
                    openModal={ openListAppicationModal }
                    onModalClose={ onCloseListAllApplicaitonModal }
                    applicationDetail={ applicationDetail }
                    idpIsinAuthSequence={ idpIsinAuthSequence }
                    authenticator={ EMAIL_OTP_AUTHENTICATOR } />
            </FlexboxGrid>
        </div>
    );
}
