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

"use client"

import type React from "react"
import { useState } from "react"
import styles from "./indexHomeComponent.module.css"
import { Button } from "rsuite";
import { IndexHomeComponentProps } from "../../models/indexHomeComponent/indexHomeComponent";
import HeroBanner from "../../../../../../../public/landing.png";
import Image from "next/image";

export function IndexHomeComponent({ logoComponent, signinOnClick, signUpOnClick, isSignUpButtonVisible }: IndexHomeComponentProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const features = [
        {
            icon: "💬",
            title: "Real-time Communication",
            description:
                "Stay connected with instant messaging, video calls, and threaded discussions that keep everyone in the loop.",
        },
        {
            icon: "📅",
            title: "Project Management",
            description:
                "Plan, track, and deliver projects on time with intuitive task management, timelines, and progress tracking.",
        },
        {
            icon: "📄",
            title: "Document Collaboration",
            description: "Create, edit, and share documents in real-time with version control and seamless integration.",
        },
        {
            icon: "🛡️",
            title: "Enterprise Security",
            description:
                "Keep your data safe with enterprise-grade security, SSO integration, and compliance certifications.",
        },
        {
            icon: "⚡",
            title: "Workflow Automation",
            description: "Automate repetitive tasks and streamline processes with custom workflows and integrations.",
        },
        {
            icon: "📊",
            title: "Team Analytics",
            description: "Gain insights into team performance and project progress with detailed analytics and reporting.",
        },
    ]

    const testimonials = [
        {
            quote: "Teamspace transformed how our remote team collaborates. We're 40% more productive since switching.",
            author: "Sarah Chen",
            role: "VP of Engineering",
            company: "TechCorp",
        },
        {
            quote: "The best investment we've made for our team. The ROI was clear within the first month.",
            author: "Michael Rodriguez",
            role: "Project Manager",
            company: "InnovateLab",
        },
        {
            quote: "Finally, a platform that brings everything together. Our team loves the intuitive interface.",
            author: "Emily Johnson",
            role: "Creative Director",
            company: "DesignStudio",
        },
    ]

    const pricingPlans = [
        {
            name: "Starter",
            price: "Free",
            description: "Perfect for small teams getting started",
            features: [
                "Up to 5 team members",
                "Basic project management",
                "5GB storage",
                "Community support",
                "Basic integrations",
            ],
            cta: "Get Started",
            popular: false,
        },
        {
            name: "Professional",
            price: "$12",
            period: "/user/month",
            description: "For growing teams that need more power",
            features: [
                "Unlimited team members",
                "Advanced project management",
                "100GB storage",
                "Priority support",
                "Advanced integrations",
                "Custom workflows",
                "Team analytics",
            ],
            cta: "Start Free Trial",
            popular: true,
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "For large organizations with custom needs",
            features: [
                "Everything in Professional",
                "SSO & advanced security",
                "Unlimited storage",
                "Dedicated support",
                "Custom integrations",
                "Advanced compliance",
                "On-premise deployment",
            ],
            cta: "Contact Sales",
            popular: false,
        },
    ]

    const stats = [
        { value: "10,000+", label: "Teams worldwide" },
        { value: "99.9%", label: "Uptime guarantee" },
        { value: "50+", label: "Integrations" },
        { value: "24/7", label: "Support available" },
    ]

    return (
        <div className={styles.landingPage}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.container}>
                    <div className={styles.headerContent}>
                        <div className={styles.logo}>
                            <div className={styles.logoIcon}>👥</div>
                            <span className={styles.logoText}>Teamspace</span>
                        </div>

                        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ""}`}>
                            <a href="#features" className={styles.navLink}>
                                Features
                            </a>
                            <a href="#testimonials" className={styles.navLink}>
                                Testimonials
                            </a>
                            <a href="#pricing" className={styles.navLink}>
                                Pricing
                            </a>
                            <a href="#contact" className={styles.navLink}>
                                Contact
                            </a>
                        </nav>

                        <div className={styles.headerActions}>
                            <Button
                                className={styles.signUpButton}
                                size="md"
                                appearance="link"
                                onClick={signUpOnClick}
                            >
                                Get Started
                            </Button>
                            <Button
                                className={styles.signInButton}
                                size="md"
                                appearance="primary"
                                onClick={signinOnClick}
                            >
                                Sign In
                            </Button>
                        </div>

                        <button className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? "✕" : "☰"}
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.container}>
                    <div className={styles.heroContent}>
                        <div className={styles.heroText}>
                            <div className={styles.heroBadge}>🚀 New: AI-powered insights now available</div>

                            <h1 className={styles.heroTitle}>
                                Where teams <span className={styles.highlight}>collaborate</span> and ideas come to life
                            </h1>

                            <p className={styles.heroDescription}>
                                Streamline your team's workflow with our all-in-one collaboration platform. Chat, plan, share, and
                                deliver exceptional results together.
                            </p>

                            <div className={styles.heroActions}>
                                <Button
                                    className={styles.signUpButton}
                                    size="lg"
                                    appearance="primary"
                                    onClick={signUpOnClick}
                                    style={{ borderRadius: "40px !important" }}
                                >
                                    Start Free Trial →
                                </Button>
                                <button className={`${styles.btnSecondary} ${styles.btnLarge}`}  style={{ borderRadius: "40px !important" }}>▶ Watch Demo</button>
                            </div>

                            <div className={styles.heroFeatures}>
                                <div className={styles.featureItem}>
                                    <span className={styles.checkmark}>✓</span>
                                    Free 14-day trial
                                </div>
                                <div className={styles.featureItem}>
                                    <span className={styles.checkmark}>✓</span>
                                    No credit card required
                                </div>
                            </div>
                        </div>

                        <div className={styles.heroImage}>
                            <img src="/placeholder.svg?height=500&width=600" alt="Teamspace Dashboard" />
                            <div className={styles.statusBadge}>
                                <div className={styles.statusDot}></div>
                                <span>12 team members online</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.heroBanner}>
                    <Image alt="hero banner" src={HeroBanner} height={500} />
                </div>
            </section>
        </div>
    )
}

export default IndexHomeComponent;
