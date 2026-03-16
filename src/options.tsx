import { useEffect, useMemo, useState } from "react";
import { generateRSS } from "~lib/rsshub";
import { getAutoCopyPage, getAutoCopyPopup, getAutoDetect, getRules, saveRules, setAutoCopyPage, setAutoCopyPopup, setAutoDetect } from "~lib/storage";
import icon from "../assets/icon.png";

const PAGE_SIZE = 4

interface Rule {
    name: string
    rule: string
    template: string
}

interface TestResult {
    success: boolean
    result: string
    ruleName?: string
    ruleIndex?: number
}

const styles = {
    container: {
        maxWidth: 800,
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#374151",
        lineHeight: "1.5"
    },
    section: {
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 24,
        marginBottom: 32,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    },
    sectionTitle: {
        fontSize: "1.25rem",
        fontWeight: 600,
        marginBottom: 20,
        color: "#111827",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
    },
    settingItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "16px 0",
        borderBottom: "1px solid #f3f4f6"
    },
    settingText: {
        flex: 1,
        paddingRight: 20
    },
    settingLabel: {
        display: "block",
        fontWeight: 500,
        color: "#1f2937",
        marginBottom: 4,
        cursor: "pointer"
    },
    settingDesc: {
        fontSize: "13px",
        color: "#6b7280"
    },
    input: {
        width: "100%",
        padding: "10px 12px",
        border: "1px solid #d1d5db",
        borderRadius: 6,
        fontSize: "14px",
        boxSizing: "border-box" as const,
        marginBottom: 10
    },
    card: {
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        padding: 20,
        borderRadius: 8,
        marginBottom: 16,
        boxSizing: "border-box" as const
    },
    btnPrimary: {
        background: "#f5712c",
        color: "#fff",
        border: "none",
        padding: "10px 18px",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 500,
        fontSize: "14px"
    },
    btnSecondary: {
        border: "1px solid #d1d5db",
        background: "#fff",
        color: "#374151",
        padding: "10px 18px",
        borderRadius: 6,
        cursor: "pointer",
        fontWeight: 500,
        fontSize: "14px"
    },
    btnAction: {
        padding: "6px 12px",
        fontSize: "13px",
        marginRight: 8,
        borderRadius: 4,
        border: "1px solid #d1d5db",
        background: "#fff",
        cursor: "pointer"
    },
    btnDelete: {
        padding: "6px 12px",
        fontSize: "13px",
        borderRadius: 4,
        border: "none",
        background: "#fee2e2",
        color: "#b91c1c",
        cursor: "pointer",
        float: "right" as const
    },
    pagination: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        marginTop: 24
    }
}

export default function Options() {
    const [rules, setRules] = useState<Rule[]>([])
    const [currentPage, setCurrentPage] = useState(1)

    const [autoDetect, setAutoDetectState] = useState(false)
    const [autoCopyPage, setAutoCopyPageState] = useState(false)
    const [autoCopyPopup, setAutoCopyPopupState] = useState(true)

    const [testUrl, setTestUrl] = useState("")
    const [testResult, setTestResult] = useState<TestResult | null>(null)

    const totalPages = Math.max(1, Math.ceil(rules.length / PAGE_SIZE))

    const pageOffset = (currentPage - 1) * PAGE_SIZE

    const displayedRules = useMemo(() => {
        return rules.slice(pageOffset, pageOffset + PAGE_SIZE)
    }, [rules, currentPage])

    useEffect(() => {
        load()
    }, [])

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages)
    }, [totalPages])

    async function load() {
        const [rulesData, autoDetectData, autoCopyPageData, autoCopyPopupData] =
            await Promise.all([
                getRules(),
                getAutoDetect(),
                getAutoCopyPage(),
                getAutoCopyPopup()
            ])

        setRules(rulesData)
        setAutoDetectState(autoDetectData)
        setAutoCopyPageState(autoCopyPageData)
        setAutoCopyPopupState(autoCopyPopupData)
    }

    function updateRule(index: number, field: keyof Rule, value: string) {
        setRules((prev) =>
            prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
        )
    }

    function removeRule(index: number) {
        if (!confirm(chrome.i18n.getMessage("message_options_rule_remove_confirm"))) return
        setRules((prev) => prev.filter((_, i) => i !== index))
    }

    function addRule() {
        setRules((prev) => {
            const next = [...prev, { name: "", rule: "", template: "" }]
            setCurrentPage(Math.ceil(next.length / PAGE_SIZE))
            return next
        })
    }

    function moveRule(index: number, dir: -1 | 1) {
        setRules((prev) => {
            const target = index + dir
            if (target < 0 || target >= prev.length) return prev

            const next = [...prev]
            ;[next[index], next[target]] = [next[target], next[index]]

            return next
        })
    }

    async function saveAll() {
        await saveRules(rules)
        alert(chrome.i18n.getMessage("message_options_rule_save_success"))
    }

    function exportRules() {
        const blob = new Blob([JSON.stringify(rules, null, 2)], {
            type: "application/json"
        })

        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")

        a.href = url
        a.download = `rsshub_rules_${Date.now()}.json`
        a.click()

        URL.revokeObjectURL(url)
    }

    async function importRules(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()

        reader.onload = async () => {
            try {
                const json = JSON.parse(reader.result as string)

                if (!Array.isArray(json)) throw new Error(chrome.i18n.getMessage("message_options_rule_import_invalid_1"))

                const valid = json.every(
                    (r) =>
                        typeof r.name === "string" &&
                        typeof r.rule === "string" &&
                        typeof r.template === "string"
                )

                if (!valid) throw new Error(chrome.i18n.getMessage("message_options_rule_import_invalid_2"))

                setRules(json)

                await saveRules(json)

                alert(chrome.i18n.getMessage("message_options_rule_import_success"))
            } catch (err) {
                alert(chrome.i18n.getMessage("message_options_rule_import_fail", [err]))
            }
        }

        reader.readAsText(file)
    }

    function runTest() {
        const url = testUrl.trim()

        if (!url) {
            setTestResult({
                success: false,
                result: chrome.i18n.getMessage("text_options_test_invalid_1")
            })
            return
        }

        const result = generateRSS(url, rules)

        if (!result) {
            setTestResult({
                success: false,
                result: chrome.i18n.getMessage("text_options_test_invalid_2")
            })
            return
        }

        setTestResult({
            success: true,
            result: result.rss,
            ruleName: result.rule.name,
            ruleIndex: result.ruleIndex + 1
        })
    }

    return (
        <div style={styles.container}>
            <header style={{ textAlign: "center", marginBottom: 40 }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <img
                        src={icon}
                        alt={chrome.i18n.getMessage("meta_name")}
                        style={{ width: 50, height: 50, marginRight: 10 }}
                    />
                    <h1
                        style={{
                            color: "#f5712c",
                            fontSize: "2rem",
                            margin: "0 0 8px 0"
                        }}>
                        {chrome.i18n.getMessage("meta_name")}
                    </h1>
                </div>
                <p style={{ color: "#6b7280", margin: 0 }}>
                    {chrome.i18n.getMessage("text_options_desc")}
                </p>
            </header>

            {/* 偏好设置 */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>{chrome.i18n.getMessage("text_options_section_preference_title")}</h2>

                <div style={styles.settingItem}>
                    <div style={styles.settingText}>
                        <label htmlFor="autoDetect" style={styles.settingLabel}>
                            {chrome.i18n.getMessage("text_options_preference_autoDetect_title")}
                        </label>
                        <span style={styles.settingDesc}>
                            {chrome.i18n.getMessage("text_options_preference_autoDetect_desc")}
                        </span>
                    </div>
                    <input
                        id="autoDetect"
                        type="checkbox"
                        checked={autoDetect}
                        onChange={(e) => {
                            setAutoDetectState(e.target.checked)
                            setAutoDetect(e.target.checked)
                        }}
                    />
                </div>

                <div style={styles.settingItem}>
                    <div style={styles.settingText}>
                        <label
                            htmlFor="autoCopyPage"
                            style={styles.settingLabel}>
                            {chrome.i18n.getMessage("text_options_preference_autoCopy_title")}
                        </label>
                        <span style={styles.settingDesc}>
                            {chrome.i18n.getMessage("text_options_preference_autoCopy_desc")}
                        </span>
                    </div>
                    <input
                        id="autoCopyPage"
                        type="checkbox"
                        checked={autoCopyPage}
                        onChange={(e) => {
                            setAutoCopyPageState(e.target.checked)
                            setAutoCopyPage(e.target.checked)
                        }}
                    />
                </div>

                <div style={{ ...styles.settingItem, borderBottom: "none" }}>
                    <div style={styles.settingText}>
                        <label
                            htmlFor="autoCopyPopup"
                            style={styles.settingLabel}>
                            {chrome.i18n.getMessage("text_options_preference_autoPopupCopy_title")}
                        </label>
                        <span style={styles.settingDesc}>
                            {chrome.i18n.getMessage("text_options_preference_autoPopupCopy_desc")}
                        </span>
                    </div>
                    <input
                        id="autoCopyPopup"
                        type="checkbox"
                        checked={autoCopyPopup}
                        onChange={(e) => {
                            setAutoCopyPopupState(e.target.checked)
                            setAutoCopyPopup(e.target.checked)
                        }}
                    />
                </div>
            </section>

            {/* 规则管理 */}
            <section style={styles.section}>
                <div style={styles.sectionTitle}>
                    <span>{chrome.i18n.getMessage("text_options_section_rule_title")} ({rules.length})</span>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            style={styles.btnSecondary}
                            onClick={exportRules}>
                            {chrome.i18n.getMessage("gui_options_button_export")}
                        </button>

                        <button
                            style={styles.btnSecondary}
                            onClick={() =>
                                document.getElementById("import-input")?.click()
                            }>
                            {chrome.i18n.getMessage("gui_options_button_import")}
                        </button>

                        <input
                            id="import-input"
                            type="file"
                            hidden
                            accept=".json"
                            onChange={importRules}
                        />

                        <button style={styles.btnPrimary} onClick={saveAll}>
                            {chrome.i18n.getMessage("gui_options_button_save")}
                        </button>
                    </div>
                </div>

                {displayedRules.map((rule, i) => {
                    const index = pageOffset + i

                    return (
                        <div key={index} style={styles.card}>
                            <div
                                style={{
                                    marginBottom: 12,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                <b style={{ color: "#f5712c" }}>
                                    #{index + 1} {rule.name || chrome.i18n.getMessage("text_options_rule_untitled")}
                                </b>

                                <button
                                    style={styles.btnDelete}
                                    onClick={() => removeRule(index)}>
                                    {chrome.i18n.getMessage("gui_options_button_remove")}
                                </button>
                            </div>

                            <input
                                style={styles.input}
                                placeholder={chrome.i18n.getMessage("placeholder_options_rule_name")}
                                value={rule.name}
                                onChange={(e) =>
                                    updateRule(index, "name", e.target.value)
                                }
                            />

                            <input
                                style={styles.input}
                                placeholder={chrome.i18n.getMessage("placeholder_options_rule_rule")}
                                value={rule.rule}
                                onChange={(e) =>
                                    updateRule(index, "rule", e.target.value)
                                }
                            />

                            <input
                                style={{ ...styles.input, marginBottom: 15 }}
                                placeholder={chrome.i18n.getMessage("placeholder_options_rule_template")}
                                value={rule.template}
                                onChange={(e) =>
                                    updateRule(
                                        index,
                                        "template",
                                        e.target.value
                                    )
                                }
                            />

                            <div
                                style={{
                                    borderTop: "1px solid #e5e7eb",
                                    paddingTop: 12
                                }}>
                                <button
                                    style={styles.btnAction}
                                    onClick={() => moveRule(index, -1)}>
                                    ↑ {chrome.i18n.getMessage("gui_options_button_up")}
                                </button>

                                <button
                                    style={styles.btnAction}
                                    onClick={() => moveRule(index, 1)}>
                                    ↓ {chrome.i18n.getMessage("gui_options_button_down")}
                                </button>
                            </div>
                        </div>
                    )
                })}

                <button
                    style={{
                        ...styles.btnSecondary,
                        width: "100%",
                        borderStyle: "dashed"
                    }}
                    onClick={addRule}>
                    + {chrome.i18n.getMessage("gui_options_button_add")}
                </button>

                {totalPages > 1 && (
                    <div style={styles.pagination}>
                        <button
                            disabled={currentPage === 1}
                            style={{
                                ...styles.btnSecondary,
                                opacity: currentPage === 1 ? 0.5 : 1
                            }}
                            onClick={() => setCurrentPage((p) => p - 1)}>
                            {chrome.i18n.getMessage("gui_options_button_prev")}
                        </button>

                        <span style={{ fontSize: "14px", fontWeight: 500 }}>
                            第 {currentPage} / {totalPages} 页
                            {chrome.i18n.getMessage("text_options_rule_current", [currentPage.toString(), totalPages.toString()])}
                        </span>

                        <button
                            disabled={currentPage === totalPages}
                            style={{
                                ...styles.btnSecondary,
                                opacity: currentPage === totalPages ? 0.5 : 1
                            }}
                            onClick={() => setCurrentPage((p) => p + 1)}>
                            {chrome.i18n.getMessage("gui_options_button_next")}
                        </button>
                    </div>
                )}
            </section>

            {/* 规则测试器 */}
            <section
                style={{ ...styles.section, border: "1px solid #f5712c44" }}>
                <h2 style={styles.sectionTitle}>{chrome.i18n.getMessage("text_options_section_test_title")}</h2>

                <p style={{ ...styles.settingDesc, marginBottom: 16 }}>
                    {chrome.i18n.getMessage("text_options_section_test_desc")}
                </p>

                <div style={{ display: "flex", gap: 10 }}>
                    <input
                        style={{ ...styles.input, flex: 1, marginBottom: 0 }}
                        placeholder="https://..."
                        value={testUrl}
                        onChange={(e) => setTestUrl(e.target.value)}
                    />

                    <button style={styles.btnPrimary} onClick={runTest}>
                        {chrome.i18n.getMessage("gui_options_button_runTest")}
                    </button>
                </div>

                {testResult && (
                    <div
                        style={{
                            marginTop: 16,
                            padding: 16,
                            borderRadius: 8,
                            background: testResult.success
                                ? "#ecfdf5"
                                : "#fef2f2",
                            border: `1px solid ${
                                testResult.success ? "#10b981" : "#ef4444"
                            }`
                        }}>
                        <div
                            style={{
                                fontWeight: 600,
                                color: testResult.success
                                    ? "#047857"
                                    : "#b91c1c",
                                marginBottom: 4
                            }}>
                            {testResult.success
                                ? chrome.i18n.getMessage("text_options_test_success", [testResult.ruleIndex.toString(), `${testResult.ruleName || chrome.i18n.getMessage("text_options_rule_untitled")}`])
                                : chrome.i18n.getMessage("text_options_test_fail", [testResult.result])}
                        </div>

                        {testResult.success && (
                            <div
                                style={{
                                    background: "rgba(255,255,255,0.6)",
                                    padding: "10px",
                                    borderRadius: 4,
                                    fontSize: "13px",
                                    fontFamily: "monospace",
                                    wordBreak: "break-all",
                                    color: "#f5712c"
                                }}>
                                {testResult.result}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    )
}
