import { useEffect, useState } from "react";
import { generateRSS } from "~lib/rsshub";
import { getAutoCopyPopup, getRules } from "~lib/storage"
import icon from "../assets/icon.png"

const styles = {
    container: {
        width: 320,
        padding: "16px",
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: "#ffffff",
        color: "#333"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
    },
    title: {
        margin: 0,
        fontSize: "18px",
        fontWeight: 600,
        color: "#f5712c",
        display: "flex",
        justifyContent: "center"
    },
    content: {
        backgroundColor: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "16px"
    },
    urlText: {
        wordBreak: "break-all" as const,
        fontSize: "13px",
        color: "#4b5563",
        lineHeight: "1.5",
        margin: 0,
        maxHeight: "80px",
        overflowY: "auto" as const
    },
    buttonGroup: {
        display: "flex",
        gap: "8px",
        marginBottom: "12px"
    },
    primaryBtn: {
        flex: 1,
        padding: "8px 12px",
        backgroundColor: "#f5712c",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: 500,
        transition: "background 0.2s"
    },
    secondaryBtn: {
        flex: 1,
        padding: "8px 12px",
        backgroundColor: "white",
        color: "#374151",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: 500
    },
    settingsBtn: {
        background: "none",
        border: "none",
        color: "#9ca3af",
        cursor: "pointer",
        fontSize: "13px",
        textDecoration: "underline"
    },
    emptyText: {
        textAlign: "center" as const,
        color: "#9ca3af",
        padding: "20px 0",
        fontSize: "14px"
    }
}

export default function Popup() {
    const [rss, setRss] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    async function detect() {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        })
        if (!tab?.url) return

        const rules = await getRules()
        const result = generateRSS(tab.url, rules).rss

        if (result) {
            setRss(result)

            const autoCopy = await getAutoCopyPopup()

            if (autoCopy) {
                await navigator.clipboard.writeText(result)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }
        }
    }

    const handleCopy = async () => {
        if (rss) {
            await navigator.clipboard.writeText(rss)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    useEffect(() => {
        detect()
    }, [])

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h3 style={styles.title}>
                    <img
                        src={icon}
                        alt="RSSHub Helper"
                        style={{ width: 30, height: 30, marginRight: 5 }}
                    />
                    {chrome.i18n.getMessage("meta_name")}
                </h3>
                <button
                    style={styles.settingsBtn}
                    onClick={() => chrome.runtime.openOptionsPage()}>
                    {chrome.i18n.getMessage("gui_popup_button_setting")}
                </button>
            </header>

            {rss ? (
                <>
                    <div style={styles.content}>
                        <p style={styles.urlText}>{rss}</p>
                    </div>

                    <div style={styles.buttonGroup}>
                        <button
                            style={{
                                ...styles.primaryBtn,
                                backgroundColor: copied ? "#10b981" : "#f5712c"
                            }}
                            onClick={handleCopy}>
                            {copied ? chrome.i18n.getMessage("text_popup_copied") : chrome.i18n.getMessage("gui_popup_button_copy")}
                        </button>
                        <button
                            style={styles.secondaryBtn}
                            onClick={() => chrome.tabs.create({ url: rss })}>
                            {chrome.i18n.getMessage("gui_popup_button_open")}
                        </button>
                    </div>
                </>
            ) : (
                <div style={styles.emptyText}>
                    <p>{chrome.i18n.getMessage("text_popup_noRSS")}</p>
                </div>
            )}
        </div>
    )
}
