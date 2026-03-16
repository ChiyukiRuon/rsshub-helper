<div align="center">

<div style="align-items: center; display: flex; justify-content: center;">
<img src="./assets/icon.png" alt="RSSHub Helper Logo" style="width: 80px; height: 80px;" />
<h1 style="color: #f5712c; margin: 0 0 19px 10px;">RSSHub Helper</h1>
</div>

<a href="https://github.com/ChiyukiRuon/rsshub-helper/blob/main/README.md">English</a> ｜ <a href="https://github.com/ChiyukiRuon/rsshub-helper/blob/main/README_zh_CN.md">简体中文</a>

</div>

**RSSHub Helper** is a Chrome browser extension built with **Plasmo**. It helps quickly detect whether the current webpage matches RSSHub routing rules and generates the corresponding RSS subscription link. By defining custom matching rules, you can easily convert almost any webpage into an RSS feed.

---

# Features

* **Automatic RSS Detection** – Automatically analyzes the current URL when a page loads and generates RSS links based on predefined rules
* **One-Click Copy / Open** – Quickly copy the generated RSS link or open it directly for preview
* **Rule Management** – Supports editing, importing, and exporting rules
* **Rule Tester** – Test whether rules correctly match a target URL
* **Multi-language Support** – Supports both Simplified Chinese and English interfaces
* **Auto Copy** – Automatically copy the generated RSS link to the clipboard when a rule is detected

---

# Usage

## Install the Extension

1. Download the compressed package from the [Release](https://github.com/ChiyukiRuon/rsshub-helper/releases)
2. Install manually:

    * Open Chrome and go to `chrome://extensions/`
    * Enable **Developer Mode**
    * Click **Load unpacked**
    * Select the extracted extension folder

---

## Configure Rules

1. **Open the settings page**

    * Click **Settings** in the popup
    * Or right-click the extension icon and select **Options**

2. **Add a rule**

    * Click **+ Add Rule** in the **Rule Management** section

3. **Fill in rule information**

    * **Rule Name** – A descriptive name for the rule
    * **Matching Pattern** – URL matching pattern, supporting:

        * `*` – Matches a single path segment
        * `**` – Matches any content
        * `${var}` – Extracts variables for use in the template
    * **RSSHub Template** – RSS link template using `${var}` variables

4. **Save rules**

    * Click **Save** to apply all changes

5. **Test rules**

    * Use the **Rule Tester** to verify whether a rule correctly matches a URL

---

## Rule Example

```json
{
   "name": "X Media",
   "rule": "https://x.com/${user}**",
   "template": "https://rsshub.app/twitter/media/${user}"
}
```

---

## Basic Usage

1. **Click the extension icon** – Click the RSSHub Helper icon on the current page
2. **View RSS links** – The popup window will display the matched RSS links
3. **Copy or open** – Click **Copy** to copy the link or **Open Preview** to view it in a new tab

---

## Preferences

* **Auto Detect RSS** – Automatically analyze RSS links when the page loads
* **Auto Copy** – Automatically copy the RSS link when a rule is matched
* **Copy When Popup Opens** – Automatically copy the RSS link when the popup is opened

---

# Local Development

## Requirements

* Node.js 16+
* pnpm 8+

---

## Development Workflow

### 1. Clone the repository

```bash
git clone https://github.com/ChiyukiRuon/rsshub-helper.git
cd rsshub-helper
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start the development server

```bash
pnpm dev
```

This will start the **Plasmo development server** and generate extension files in:

```
build/chrome-mv3-dev
```

---

### 4. Load the extension in Chrome

* Open Chrome and go to `chrome://extensions/`
* Enable **Developer Mode**
* Click **Load unpacked**
* Select the `build/chrome-mv3-dev` directory

In development mode, the extension will **auto-reload when code changes**.

---

### 5. Production build

```bash
pnpm build
```

Output files will be generated in:

```
build/chrome-mv3-prod
```

---

### 6. Package the extension

```bash
pnpm package
```

A `.zip` file will be generated for release.

---

# Project Structure

```
rsshub-helper/
├── src/                      # Source code
│   ├── contents/            # Content scripts
│   │   └── autoDetect.ts    # Auto detection logic
│   ├── lib/                 # Utility libraries
│   │   ├── domReady.ts      # DOM ready helper
│   │   ├── rsshub.ts        # RSS rule matching core
│   │   ├── storage.ts       # Storage configuration
│   │   ├── storageCache.ts  # Storage cache
│   │   └── throttle.ts      # Throttle utility
│   ├── types/               # TypeScript type definitions
│   │   └── assets.d.ts      # Asset declarations
│   ├── background.ts        # Background script
│   ├── options.tsx          # Options page
│   ├── popup.tsx            # Popup window
│   └── style.css            # Global styles
├── locales/                  # Internationalization files
│   ├── en/                  # English translations
│   └── zh_CN/               # Simplified Chinese translations
├── assets/                   # Static assets
│   └── icon.png             # Extension icon
├── build/                    # Build output
└── package.json             # Project configuration
```

---

# Core Logic

The rule matching engine is located in
[`src/lib/rsshub.ts`](src/lib/rsshub.ts).

Main functions include:

* **`compileRule()`** – Compiles a rule string into a regular expression
* **`extract()`** – Extracts variables from the URL based on the rule
* **`render()`** – Renders extracted variables into the RSS template
* **`generateRSS()`** – Iterates through the rule list and generates RSS links

---

# Links

* [RSSHub Official Documentation](https://docs.rsshub.app/)

---

# License

MIT License

---

**Note:**
This extension requires an **RSSHub service** to work. You can use a public RSSHub instance (such as `https://rsshub.app`) or deploy your own private instance.
