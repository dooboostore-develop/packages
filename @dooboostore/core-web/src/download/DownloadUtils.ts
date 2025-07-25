export namespace DownloadUtils {
  export const download = (window: Window, url: string, filename: string = 'download') => {
    const a = window.document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none'; // Add this line to hide the element
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}