import { escapeAttribute, escapeHtml } from "../../site/html";

export function xenixDownloadReady(downloadUrl: string): string {
  return `<p class="message success">
  已获取下载地址，下载将自动开始。若浏览器没有自动下载，
  <a href="${escapeAttribute(downloadUrl)}" data-xenix-download-link download hx-boost="false">点击这里手动下载 Xenix</a>。
</p>`;
}

export function xenixDownloadError(message: string): string {
  return `<p class="message error" role="alert">${escapeHtml(message)}</p>`;
}
