<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> • RSS Feed</title>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;background:#0d1117;color:#e6edf3;padding:0 0 80px}
          .rss-header{background:#161b27;border-bottom:1px solid #21262d;padding:32px 24px}
          .rss-inner{max-width:740px;margin:0 auto}
          .rss-badge{display:inline-flex;align-items:center;gap:6px;background:#f26522;color:#fff;font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:4px;margin-bottom:14px}
          .rss-title{font-size:1.6rem;font-weight:800;letter-spacing:-.02em;color:#e6edf3}
          .rss-desc{font-size:.9rem;color:#8b949e;margin-top:8px;line-height:1.6}
          .rss-link{display:inline-flex;align-items:center;gap:6px;margin-top:16px;color:#4e80ee;font-size:.875rem;font-weight:500;text-decoration:none}
          .rss-link:hover{text-decoration:underline}
          .rss-items{max-width:740px;margin:32px auto 0;padding:0 24px;display:flex;flex-direction:column;gap:16px}
          .rss-item{background:#161b27;border:1px solid #21262d;border-radius:8px;padding:20px 24px;transition:border-color .15s}
          .rss-item:hover{border-color:#4e80ee}
          .rss-item-title{font-size:1rem;font-weight:700;color:#e6edf3;line-height:1.4}
          .rss-item-title a{color:inherit;text-decoration:none}
          .rss-item-title a:hover{color:#4e80ee}
          .rss-item-meta{font-size:.75rem;color:#8b949e;margin-top:6px}
          .rss-item-desc{font-size:.875rem;color:#8b949e;margin-top:10px;line-height:1.6}
        </style>
      </head>
      <body>
        <div class="rss-header">
          <div class="rss-inner">
            <div class="rss-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/></svg>
              RSS Feed
            </div>
            <h1 class="rss-title"><xsl:value-of select="/rss/channel/title"/></h1>
            <p class="rss-desc"><xsl:value-of select="/rss/channel/description"/></p>
            <a class="rss-link" href="{/rss/channel/link}">Visit website →</a>
          </div>
        </div>
        <div class="rss-items">
          <xsl:for-each select="/rss/channel/item">
            <div class="rss-item">
              <p class="rss-item-title">
                <a href="{link}"><xsl:value-of select="title"/></a>
              </p>
              <p class="rss-item-meta"><xsl:value-of select="pubDate"/></p>
              <p class="rss-item-desc"><xsl:value-of select="description"/></p>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
