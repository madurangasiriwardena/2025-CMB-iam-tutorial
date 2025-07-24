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

import { Button } from "rsuite";
import styles from "./indexHomeComponent.module.css";
import { IndexHomeComponentProps } from "../../models/indexHomeComponent/indexHomeComponent";

/**
 * First page component
 *
 * @param prop - tagText, signinOnClick
 */
export function IndexHomeComponent(prop: IndexHomeComponentProps) {
    const { logoComponent, signinOnClick, signUpOnClick, isSignUpButtonVisible } = prop;

    return (
        <div className={styles.container}>
            {/* Top Bar */}
            <header className={styles.topBar}>
                <div className={styles.logoContainer}>
                    {logoComponent}
                </div>
                <div className={styles.buttonContainer}>
                    <Button
                        className={styles.signInButton}
                        size="md"
                        appearance="default"
                        onClick={signinOnClick}
                    >
                        Sign In
                    </Button>
                    {isSignUpButtonVisible && (
                        <Button
                            className={styles.signUpButton}
                            size="md"
                            appearance="primary"
                            onClick={signUpOnClick}
                        >
                            Sign Up
                        </Button>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <main className={styles.main}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Empower Your Team</h1>
                    <p className={styles.heroSubtitle}>
                        Seamlessly connect, collaborate, and achieve your goals with Teamspace.
                    </p>
                    <p className={styles.heroSubtitle}>
                        Unlock the potential of your team with tools designed for productivity, 
                        communication, and collaboration. Start your journey today!
                    </p>
                    <Button
                        className={styles.getStartedButton}
                        size="lg"
                        appearance="primary"
                        onClick={signUpOnClick}
                    >
                        Get Started
                    </Button>
                </div>
                <div className={styles.heroImage}>
                    <div className={styles.imageRotator}>
                        <img
                            src="/scheduling.jpg"
                            alt="Scheduling"
                            className={styles.image}
                        />
                        <img
                            src="/team-collab.jpg"
                            alt="Team collaboration"
                            className={styles.image}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default IndexHomeComponent;
