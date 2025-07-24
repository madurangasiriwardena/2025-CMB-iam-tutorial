import React from "react";
import { CustomProvider, Button } from "rsuite";
import { generateThemeVars } from "./themeUtils";
import logoImage from "../../../../../ui/ui-assets/lib/images/teamspace_logo.png";

interface BrandingPreviewSectionProps {
    logoUrl: string;
    logoAltText: string;
    primaryColor: string;
    secondaryColor: string;
}

const BrandingPreviewSection: React.FC<BrandingPreviewSectionProps> = ({ logoUrl, logoAltText, primaryColor, secondaryColor }) => {
    const themeVars = generateThemeVars({ primaryColor, secondaryColor });
    logoUrl = logoUrl || logoImage.src;
    return (
        <CustomProvider theme="default">
            <div
                style={{
                    display: "flex",
                    height: "340px",
                    width: "660px",
                    background: "#f7f7fa",
                    borderRadius: "12px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
                    overflow: "hidden",
                    transform: "scale(0.7)",
                    transformOrigin: "top left"
                }}
                className="branding-preview-theme"
            >
                {/* Left Side Menu */}
                <div style={{
                    width: "120px",
                    minWidth: "110px",
                    background: "var(--rs-primary-500)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "18px 0 18px 0",
                }}>
                    {/* Logo at the top */}
                    <div style={{ width: "100%" }}>
                        <img src={logoUrl} alt={logoAltText} style={{ maxWidth: "80px", maxHeight: "80px", marginBottom: "10px", display: "block", marginLeft: "auto", marginRight: "auto" }} />
                        {/* Menu items */}
                        <div style={{ marginTop: "30px" }}>
                            <div style={{
                                background: "rgba(255,255,255,0.18)",
                                color: "#fff",
                                fontWeight: 700,
                                borderRadius: "6px",
                                padding: "5px 0",
                                textAlign: "center",
                                fontSize: "10px",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                            }}>Manage Meetings</div>
                            <div style={{
                                color: "#e0e0e0",
                                padding: "5px 0",
                                textAlign: "center",
                                fontSize: "10px"
                            }}>Manage Users</div>
                            <div style={{
                                color: "#e0e0e0",
                                padding: "5px 0",
                                textAlign: "center",
                                fontSize: "10px"
                            }}>Manage Roles</div>
                            <div style={{
                                color: "#e0e0e0",
                                padding: "5px 0",
                                textAlign: "center",
                                fontSize: "10px"
                            }}>Personalization</div>
                            <div style={{
                                color: "#e0e0e0",
                                padding: "5px 0",
                                textAlign: "center",
                                fontSize: "10px"
                            }}>Security</div>
                        </div>
                    </div>
                    {/* Sign out button at the bottom */}
                    <Button style={{
                        width: "84%",
                        padding: "9px 0",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: 600,
                        fontSize: "10px",
                        marginBottom: "0",
                        cursor: "pointer",
                    }}>Sign out</Button>
                </div>
                {/* Main Panel */}
                <div style={{ flex: 1, padding: "28px 32px", background: "#fff", display: "flex", flexDirection: "column" }}>
                    <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "20px", color: "#222" }}>Manage Meetings</div>
                    <Button
                        style={{
                            alignSelf: "flex-end",
                            marginTop: "22px",
                            padding: "10px 24px",
                            border: "none",
                            borderRadius: "6px",
                            fontWeight: 600,
                            fontSize: "14px",
                            cursor: "pointer",
                        }}
                    >
                        Schedule a meeting
                    </Button>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
                        <li style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontSize: "14px", color: "#333" }}>Team Sync - 10:00 AM</li>
                        <li style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontSize: "14px", color: "#333" }}>Project Update - 2:00 PM</li>
                        <li style={{ padding: "12px 0", borderBottom: "1px solid #eee", fontSize: "14px", color: "#333" }}>Client Call - 4:30 PM</li>
                    </ul>
                </div>
            </div>
            <style>{`
                .branding-preview-theme {
                    ${Object.entries(themeVars).map(([key, value]) => `${key}: ${value};`).join('\n')}
                }
            `}</style>
        </CustomProvider>
    );
};

export default BrandingPreviewSection;
