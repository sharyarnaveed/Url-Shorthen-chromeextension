import { useEffect, useState } from "react"
import axios from "~node_modules/axios"

function IndexPopup() {
  const [data, setData] = useState("")
  const [shortUrl, setShortUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [tabs, settabs] = useState<string | null>("current")

  useEffect(() => {
    if (typeof chrome !== "undefined") {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        setData(tabs?.[0]?.url || "")
      })
    } else {
      // fallback for dev
      setData(window.location.href || "")
    }
  }, [])

  const urlShort = async () => {
    if (!data) {
      setMessage("No URL found to shorten")
      setTimeout(() => setMessage(null), 2000)
      return
    }
    try {
      setLoading(true)
      setMessage(null)
      const params = new URLSearchParams()
      params.append("url", data)

      const response = await axios.post(
        "https://cleanuri.com/api/v1/shorten",
        params.toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      )

      setShortUrl(response.data?.result_url || null)
      setMessage("Shortened!")
      setTimeout(() => setMessage(null), 2000)
    } catch (error) {
      console.log("error in shorthening the url", error)
      setMessage("Failed to shorten URL")
      setTimeout(() => setMessage(null), 2000)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text?: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setMessage("Copied to clipboard")
      setTimeout(() => setMessage(null), 1500)
    } catch {
      setMessage("Copy failed")
      setTimeout(() => setMessage(null), 1500)
    }
  }

  const styles: { [k: string]: React.CSSProperties } = {
    container: {
      fontFamily: "Inter, Segoe UI, Roboto, sans-serif",
      width: 360,
      padding: 16,
      boxSizing: "border-box",
    },
    card: {
      background: "linear-gradient(180deg,#ffffff,#fbfbfb)",
      borderRadius: 12,
      boxShadow: "0 6px 18px rgba(22,28,45,0.08)",
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      alignItems: "stretch",
    },
    tabBar: {
      display: "flex",
      gap: 8,
      marginBottom: 4,
    },
    tab: {
      flex: 1,
      padding: "8px 10px",
      borderRadius: 8,
      textAlign: "center" as const,
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 13,
      border: "1px solid transparent",
      background: "#fff",
      color: "#374151",
    },
    tabActive: {
      background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
      color: "#fff",
      border: "1px solid rgba(99,102,241,0.12)",
      boxShadow: "0 6px 20px rgba(99,102,241,0.12)",
    },
    header: {
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    title: {
      fontSize: 16,
      fontWeight: 600,
      color: "#101828",
      margin: 0,
    },
    subtitle: {
      fontSize: 12,
      color: "#6b7280",
      margin: 0,
    },
    urlBox: {
      display: "flex",
      gap: 8,
      alignItems: "center",
    },
    input: {
      flex: 1,
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #e6e9ef",
      background: "#fff",
      fontSize: 13,
      color: "#0f172a",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    pasteInput: {
      flex: 1,
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #e6e9ef",
      background: "#fff",
      fontSize: 13,
      color: "#0f172a",
    },
    buttons: {
      display: "flex",
      gap: 8,
      marginTop: 8,
    },
    btnPrimary: {
      flex: 1,
      background: "#4f46e5",
      color: "#fff",
      border: "none",
      padding: "10px 12px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 13,
    },
    btnOutline: {
      background: "#fff",
      color: "#374151",
      border: "1px solid #e6e9ef",
      padding: "10px 12px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 13,
    },
    resultRow: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
    },
    smallText: {
      fontSize: 12,
      color: "#6b7280",
    },
    message: {
      marginTop: 8,
      fontSize: 13,
      color: "#0f172a",
      textAlign: "center" as const,
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.tabBar}>
          <div
            role="button"
            onClick={() => settabs("current")}
            style={{ ...(styles.tab as object), ...(tabs === "current" ? styles.tabActive : {}) }}
          >
            Current
          </div>
          <div
            role="button"
            onClick={() => settabs("paste")}
            style={{ ...(styles.tab as object), ...(tabs === "paste" ? styles.tabActive : {}) }}
          >
            Paste
          </div>
        </div>

        {tabs === "current" && (
          <>
            <div style={styles.header}>
              <div style={{ fontSize: 20 }}>✨</div>
              <div>
                <p style={styles.title}>Quick URL Shortener</p>
                <p style={styles.subtitle}>Shorten and copy the current tab URL</p>
              </div>
            </div>

            <div style={styles.urlBox}>
              <input
                style={styles.input}
                value={data || ""}
                readOnly
                title={data}
                onClick={(e) => {
                  ;(e.target as HTMLInputElement).select()
                }}
              />
            </div>

            <div style={styles.buttons}>
              <button
                style={styles.btnPrimary}
                onClick={urlShort}
                disabled={loading}
                aria-label="Shorten current URL"
              >
                {loading ? "Shortening..." : "Shorten"}
              </button>
              <button
                style={styles.btnOutline}
                onClick={() => {
                  copyToClipboard(data)
                }}
                aria-label="Copy current URL"
                title="Copy original URL"
              >
                Copy
              </button>
            </div>
          </>
        )}

        {tabs === "paste" && (
          <>
            <div style={styles.header}>
              <div style={{ fontSize: 20 }}>📋</div>
              <div>
                <p style={styles.title}>Paste URL</p>
                <p style={styles.subtitle}>Paste any URL below to shorten it</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                style={styles.pasteInput}
                placeholder="Paste URL here..."
                value={data || ""}
                onChange={(e) => setData(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") urlShort()
                }}
                title="Paste URL"
              />
            </div>

            <div style={styles.buttons}>
              <button
                style={styles.btnPrimary}
                onClick={urlShort}
                disabled={loading}
                aria-label="Shorten pasted URL"
              >
                {loading ? "Shortening..." : "Shorten"}
              </button>
              <button
                style={styles.btnOutline}
                onClick={() => {
                  setData("")
                  setShortUrl(null)
                }}
                aria-label="Clear input"
                title="Clear input"
              >
                Clear
              </button>
            </div>
          </>
        )}

        {shortUrl && (
          <div style={styles.resultRow}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                Short link
              </div>
              <div style={{ fontSize: 12, color: "#374151", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {shortUrl}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={styles.btnOutline}
                onClick={() => copyToClipboard(shortUrl)}
              >
                Copy
              </button>
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...styles.btnPrimary,
                  background: "#06b6d4",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Open
              </a>
            </div>
          </div>
        )}

        {message && <div style={styles.message}>{message}</div>}

        <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 12, paddingTop: 8 }}>
          <div style={styles.smallText}>
            Built with CleanURI • No tracking • Lightweight
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
