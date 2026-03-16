import { Storage } from "@plasmohq/storage"

import type { Rule } from "./rsshub"

const storage = new Storage()

const RULE_KEY = "rsshub_rules"

const AUTO_DETECT_KEY = "rsshub_auto_detect"
const AUTO_COPY_PAGE_KEY = "rsshub_auto_copy_page"
const AUTO_COPY_POPUP_KEY = "rsshub_auto_copy_popup"

export async function getRules(): Promise<Rule[]> {
    const rules = await storage.get<Rule[]>(RULE_KEY)
    return rules ?? []
}

export async function saveRules(rules: Rule[]) {
    await storage.set(RULE_KEY, rules)
}

export async function getAutoDetect() {
    return (await storage.get<boolean>(AUTO_DETECT_KEY)) ?? false
}

export async function setAutoDetect(v: boolean) {
    await storage.set(AUTO_DETECT_KEY, v)
}

export async function getAutoCopyPage() {
    return (await storage.get<boolean>(AUTO_COPY_PAGE_KEY)) ?? false
}

export async function setAutoCopyPage(v: boolean) {
    await storage.set(AUTO_COPY_PAGE_KEY, v)
}

export async function getAutoCopyPopup() {
    return (await storage.get<boolean>(AUTO_COPY_POPUP_KEY)) ?? true
}

export async function setAutoCopyPopup(v: boolean) {
    await storage.set(AUTO_COPY_POPUP_KEY, v)
}
