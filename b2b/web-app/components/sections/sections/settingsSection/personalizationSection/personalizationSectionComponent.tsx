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
    ApplicationList,
    BrandingPreference
} from "@teamspace-app/data-access-common-models-util";
import {
    controllerDecodeListCurrentApplicationInRoot,
    controllerDecodeRevertBrandingPreference
} from "@teamspace-app/data-access-controller";
import {FormButtonToolbar, FormField} from "@teamspace-app/shared/ui/ui-basic-components";
import {
    SettingsTitleComponent
} from "@teamspace-app/shared/ui/ui-components";
import {checkIfJSONisEmpty, PatchMethod} from "@teamspace-app/shared/util/util-common";
import {LOADING_DISPLAY_BLOCK, LOADING_DISPLAY_NONE} from "@teamspace-app/shared/util/util-front-end-util";
import {deletePersonalization} from "../../../../../APICalls/DeletePersonalization/delete-personalization";
import {postPersonalization} from "../../../../../APICalls/UpdatePersonalization/post-personalization";
import {Personalization} from "../../../../../types/personalization";
import {
    controllerDecodeGetBrandingPrefrence,
    controllerDecodeUpdateBrandingPrefrence
} from "@teamspace-app/data-access-controller";
import {Session} from "next-auth";
import React, {useCallback, useEffect, useState} from "react";
import {Field, Form} from "react-final-form";
import {Button, Container, Divider, Toaster, useToaster, Modal} from "rsuite";
import FormSuite from "rsuite/Form";
import {personalize, resetPersonalization} from "./personalize";
import styles from "../../../../../styles/Settings.module.css";
import {ChromePicker} from 'react-color';
import {signout} from "@teamspace-app/util-authorization-config-util";
import {upgradeTier} from "pages/api/upgrade";
import defaultBrandingPreference from "ui/ui-assets/lib/data/defaultBrandingPreference.json";

/**
 *
 * @param prop - session
 *
 * @returns The personalization interface section.
 */
interface PersonalizationSectionComponentProps {
    session: Session
}


export default function PersonalizationSectionComponent(props: PersonalizationSectionComponentProps) {
    const {session} = props;
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [loadingDisplay, setLoadingDisplay] = useState(LOADING_DISPLAY_NONE);
    const toaster: Toaster = useToaster();

    const [brandingPreference, setBrandingPreference] = useState<BrandingPreference>(null);
    const [logoUrl, setLogoUrl] = useState<string>("");
    const [logoAltText, setLogoAltText] = useState<string>("");
    const [favicon, setFavicon] = useState<string>("");
    const [primaryColor, setPrimaryColor] = useState<string>("");
    const [secondaryColor, setSecondaryColor] = useState<string>("");
    const [allApplications, setAllApplications] = useState<ApplicationList>(null);
    const [applicationId, setApplicationId] = useState<string>("");

    const fetchData = useCallback(async () => {
        fetchBrandingPreference();
    }, [session]);


    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res: ApplicationList = (await controllerDecodeListCurrentApplicationInRoot(session) as ApplicationList);
                await setAllApplications(res);
            } catch (error) {
                console.error("Error fetching applications:", error);
            }
        };

        fetchApplications();
    }, [session]);

    useEffect(() => {
        const fetchApplicationId = async () => {
            try {
                if (!checkIfJSONisEmpty(allApplications) && allApplications.totalResults !== 0) {
                    const appId = allApplications.applications[0]?.id;
                    if (appId) {
                        await setApplicationId(appId);
                        console.log("Application ID fetched:", appId);
                    } else {
                        console.error("Application ID is undefined.");
                    }
                } else {
                    console.error("No applications found or applications array is empty.");
                }
            } catch (error) {
                console.error("Error fetching application ID:", error);
            }
        };

        fetchApplicationId();
    }, [allApplications]);

    const signOutCallback = (): void => {
        signout(session);
    };

    useEffect(() => {
        fetchData();
        fetchBrandingPreference();
    }, [fetchData]);

    useEffect(() => {
        fetchBrandingPreference();
    }, []);

    const fetchBrandingPreference = async () => {
        const res: BrandingPreference = (await controllerDecodeGetBrandingPrefrence(session) as BrandingPreference);
        if (!res) {
            console.debug("Branding response is not retrieved.");
            return;
        }
        const activeTheme: string = res["preference"]["theme"]["activeTheme"];

        setLogoUrl(res["preference"]["theme"][activeTheme]["images"]["logo"]["imgURL"]);
        setLogoAltText(res["preference"]["theme"][activeTheme]["images"]["logo"]["altText"]);
        setFavicon(res["preference"]["theme"][activeTheme]["images"]["favicon"]["imgURL"]);
        setPrimaryColor(res["preference"]["theme"][activeTheme]["colors"]["primary"]["main"]);
        setSecondaryColor(res["preference"]["theme"][activeTheme]["colors"]["secondary"]["main"]);

        setBrandingPreference(res);
    };

    const onUpdate = async (values: Record<string, string>, form): Promise<void> => {
        setLoadingDisplay(LOADING_DISPLAY_BLOCK);
        // Use defaultBrandingPreference if brandingPreference is not present
        const updatedBrandingPreference: BrandingPreference = brandingPreference
            ? brandingPreference : defaultBrandingPreference;
        // Now updatedBrandingPreference is guaranteed to have the correct structure
        const activeTheme: string = updatedBrandingPreference.preference.theme.activeTheme;
        updatedBrandingPreference.preference.theme[activeTheme].images.logo.imgURL = values.logo_url;
        updatedBrandingPreference.preference.theme[activeTheme].images.logo.altText = values.logo_alt_text;
        updatedBrandingPreference.preference.theme[activeTheme].images.favicon.imgURL = values.favicon_url;
        updatedBrandingPreference.preference.theme[activeTheme].colors.primary.main = values.primary_color;
        updatedBrandingPreference.preference.theme[activeTheme].colors.secondary.main = values.secondary_color;
        updatedBrandingPreference.name = session.orgId;
        delete updatedBrandingPreference.resolvedFrom;
        controllerDecodeUpdateBrandingPrefrence(session, updatedBrandingPreference)
            .then(() => {
                const newPersonalization: Personalization = {
                    faviconUrl: values["favicon_url"],
                    logoAltText: values["logo_alt_text"],
                    logoUrl: values["logo_url"],
                    org: session.orgId,
                    primaryColor: values["primary_color"],
                    secondaryColor: values["secondary_color"]
                };
                postPersonalization(session.accessToken, newPersonalization)
                    .then(() => {
                        personalize(newPersonalization);
                    })
                    .finally(() => setLoadingDisplay(LOADING_DISPLAY_NONE));
                fetchBrandingPreference();
            })
            .finally(() => setLoadingDisplay(LOADING_DISPLAY_NONE));
        setLoadingDisplay(LOADING_DISPLAY_NONE);
    };

    const onRevert = async (): Promise<void> => {
        setLoadingDisplay(LOADING_DISPLAY_BLOCK);
        controllerDecodeRevertBrandingPreference(session)
            .then(() => {
                // Reset brandingPreference to default after revert
                setBrandingPreference(JSON.parse(JSON.stringify(defaultBrandingPreference)));
                deletePersonalization(session.accessToken)
                    .then(() => {
                        resetPersonalization();
                    });
                fetchBrandingPreference();
            })
            .finally(() => setLoadingDisplay(LOADING_DISPLAY_NONE));
    };

    const onBusinessTierUpgrade = async (): Promise<void> => {
        await upgradeTier(
            session,
            applicationId,
            session.orgId,
            "Business", // Specify the tier
            toaster,
            setLoadingDisplay,
            setShowUpgradeModal
        );
    };

    const onEnterpriseTierUpgrade = async (): Promise<void> => {
        await upgradeTier(
            session,
            applicationId,
            session.orgId,
            "Enterprise", // Specify the tier
            toaster,
            setLoadingDisplay,
            setShowUpgradeModal
        );
    };


    const ColorPickerField = ({input, meta, label, helperText}) => (
        <FormSuite.Group>
            <b>{label}</b>
            <ChromePicker
                color={input.value || '#000000'}
                onChange={(color) => input.onChange(color.hex)}
            />
            <small>{meta.touched && meta.error ? meta.error : helperText}</small>
        </FormSuite.Group>
    );

    // Check if the session has the required scope
    const hasBrandingUpdateScope = session?.scope?.includes("internal_org_branding_preference_update");

    return (
        <Container>
            {hasBrandingUpdateScope ? (
                <>
                    <SettingsTitleComponent
                        title="Personalization"
                        subtitle="Customize the user interfaces of your application."
                    />

                    <div style={{margin: "50px"}}>
                        <Form
                            onSubmit={onUpdate}
                            initialValues={{
                                favicon_url: favicon,
                                logo_alt_text: logoAltText,
                                logo_url: logoUrl,
                                primary_color: primaryColor,
                                secondary_color: secondaryColor
                            }}
                            render={({handleSubmit, form, submitting, pristine, errors}) => (
                                <FormSuite
                                    layout="vertical"
                                    className={styles.addUserForm}
                                    onSubmit={() => {
                                        handleSubmit().then(form.restart);
                                    }}
                                    fluid>

                                    <FormField
                                        name="logo_url"
                                        label="Logo URL"
                                        helperText={
                                            "Use an image that’s at least 600x600 pixels and " +
                                            "less than 1mb in size for better performance."
                                        }
                                        needErrorMessage={true}
                                    >
                                        <FormSuite.Control name="input" value="a"/>
                                    </FormField>

                                    <FormField
                                        name="logo_alt_text"
                                        label="Logo Alt Text"
                                        helperText={
                                            "Add a short description of the logo image to display when " +
                                            "the image does not load and also for SEO and accessibility."
                                        }
                                        needErrorMessage={true}
                                    >
                                        <FormSuite.Control name="input"/>
                                    </FormField>

                                    <FormField
                                        name="favicon_url"
                                        label="Favicon URL"
                                        helperText={
                                            "Use an image with a square aspect ratio that’s " +
                                            "at least 16x16 pixels in size for better results."
                                        }
                                        needErrorMessage={true}
                                    >
                                        <FormSuite.Control name="input" type="url"/>
                                    </FormField>

                                    <Field
                                        name="primary_color"
                                        component={ColorPickerField}
                                        label="Primary Colour"/>
                                    <Field
                                        name="secondary_color"
                                        component={ColorPickerField}
                                        label="Button Colour"/>

                                    <FormButtonToolbar
                                        submitButtonText="Update"
                                        submitButtonDisabled={submitting || pristine || !checkIfJSONisEmpty(errors)}
                                        needCancel={false}
                                    />

                                </FormSuite>
                            )}
                        />
                        <Divider style={{background: "#bebebe"}}/>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "24px",
                            gap: "12px"
                        }}>
                            <span style={{display: "flex", flexDirection: "column", textAlign: "left", flex: 1}}>
                                <span style={{color: "red", fontSize: "16px", fontWeight: 600}}>
                                    Revert to default
                                </span>
                                <span style={{color: "black", fontSize: "14px"}}>
                                    Once the branding preferences are reverted, they can't be recovered and your users will see Asgardeo's default branding.
                                </span>
                            </span>
                            <Button
                                className={styles["revertButton"]}
                                size="lg"
                                appearance="default"
                                onClick={onRevert}
                            >
                                Revert
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Upgrade Message */}
                    <SettingsTitleComponent
                        title="Personalization"
                        subtitle="Customize the user interfaces of your application."
                    />

                    <div style={{marginBottom: "20px"}}></div>

                    {/* Upgrade Message */}
                    <div
                        style={{
                            margin: "20px 0",
                            padding: "10px",
                            backgroundColor: "#d9d9d9",
                            borderRadius: "5px",
                            textAlign: "center",
                            color: "#272c36",
                        }}
                    >
                        <p>For more advanced customizations, upgrade your tier.</p>
                    </div>

                    {/* Tier Upgrade Cards */}
                    {(
                        <div style={{marginBottom: "30px"}}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "20px",
                                    padding: "20px",
                                    backgroundColor: "#f9f9f9",
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                {/* Business Tier */}
                                <div
                                    style={{
                                        flex: 1,
                                        textAlign: "center",
                                        padding: "20px",
                                        border: "1px solid #ddd",
                                        borderRadius: "10px",
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    <h3>Business Tier</h3>
                                    <p
                                        style={{
                                            fontSize: "24px",
                                            fontWeight: "bold",
                                            margin: "10px 0",
                                        }}
                                    >
                                        $5/user/mo
                                    </p>
                                    <p>
                                        Personalization: <strong>Advanced</strong>
                                    </p>
                                    <br></br>
                                    <Button
                                        className={styles.buttonCircular}
                                        appearance="default"
                                        onClick={onBusinessTierUpgrade}
                                    >
                                        Upgrade Now
                                    </Button>
                                </div>

                                {/* Enterprise Tier */}
                                <div
                                    style={{
                                        flex: 1,
                                        textAlign: "center",
                                        padding: "20px",
                                        border: "1px solid #ddd",
                                        borderRadius: "10px",
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    <h3>Enterprise Tier</h3>
                                    <p
                                        style={{
                                            fontSize: "24px",
                                            fontWeight: "bold",
                                            margin: "10px 0",
                                        }}
                                    >
                                        $9/user/mo
                                    </p>
                                    <p>
                                        Personalization: <strong>Custom</strong>

                                    </p>
                                    <br></br>
                                    <Button
                                        className={styles.buttonCircular}
                                        appearance="default"
                                        onClick={onEnterpriseTierUpgrade}
                                    >
                                        Upgrade Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal for Upgrade Success */}
            <Modal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} size="sm">
                <Modal.Header>
                    <Modal.Title>Plan Upgrade Successful</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>You have successfully upgraded your plan to Business Tier.</p>
                    <p>Please re-login to make the changes effective.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        appearance="default"
                        onClick={signOutCallback} // Trigger the sign-out functionality
                    >
                        Re-login
                    </Button>
                    <Button
                        appearance="ghost"
                        onClick={() => setShowUpgradeModal(false)} // Close the modal
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
