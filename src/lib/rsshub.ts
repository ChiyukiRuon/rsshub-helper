export interface Rule {
    name: string
    rule: string
    template: string
}

interface CompiledRule {
    regex: RegExp
    keys: string[]
}

const cache = new Map<string, CompiledRule>()

export function compileRule(rule: string): CompiledRule {
    if (cache.has(rule)) return cache.get(rule)!

    const keys: string[] = []

    let pattern = rule
        // ** -> match everything
        .replace(/\*\*/g, "___GLOB___")

        // * -> match one segment
        .replace(/\*/g, "___WILD___")

        // ${var}
        .replace(/\$\{(.*?)\}/g, (_, key) => {
            keys.push(key)
            return "___VAR___"
        })

    // escape regex
    pattern = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&")

    pattern = pattern
        .replace(/___GLOB___/g, ".*")
        .replace(/___WILD___/g, "[^/?#]*")
        .replace(/___VAR___/g, "([^/?#]+)")

    const compiled = {
        regex: new RegExp("^" + pattern + "$"),
        keys
    }

    cache.set(rule, compiled)

    return compiled
}

export function extract(rule: string, url: string) {
    const { regex, keys } = compileRule(rule)

    const match = url.match(regex)
    if (!match) return null

    const params: Record<string, string> = {}

    keys.forEach((k, i) => {
        params[k] = match[i + 1]
    })

    return params
}

export function render(template: string, params: Record<string, string>) {
    return template.replace(/\$\{(.*?)\}/g, (_, k) => params[k] ?? "")
}

export function generateRSS(url: string, rules: Rule[]) {
    for (let i = 0; i < rules.length; i++) {
        const r = rules[i]
        const params = extract(r.rule, url)

        if (params) {
            return {
                rss: render(r.template, params),
                ruleIndex: i,
                rule: r
            }
        }
    }

    return null
}
