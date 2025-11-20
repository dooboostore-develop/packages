export namespace DownloadUtils {
  export const download = (window: Window, url: string | Blob, filename: string = 'download') => {
    /*
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      const blob = await response.blob();
     */
    const a = window.document.createElement('a');
    const targetUrl = typeof url === 'string' ? url : URL.createObjectURL(url);
    a.href = targetUrl;
    a.download = filename;
    a.style.display = 'none'; // Add this line to hide the element
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(targetUrl);
  }
  export const csvDownload = <T>(window: Window, datas: T[], config: {includeHeader?: string, headers: (keyof T)[]}) => {

    // const headers = ['category', 'dateISO', 'letter', 'dataset'];

    const csv = datas.map(row => {
      return config.headers.map(fieldName => {
        let value = (row as any)[fieldName];
        if (value && typeof value === 'object') {
          value = JSON.stringify(value);
        }

        const stringValue = String(value === null || value === undefined ? '' : value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });
    if(config.includeHeader) {
      csv.unshift(config.headers.join(','));
    }
    const csvString = csv.join('\r\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'flag-data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}