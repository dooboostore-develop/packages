export namespace ClipBoardUtils {
  export const readText = (window: Window): Promise<string> => {
    return window.navigator.clipboard.readText();
  }

  export const read = (window: Window): Promise<ClipboardItems> => {
    return window.navigator.clipboard.read();
  }

  export const writeText = (data: string, window: Window): Promise<void> => {

    if (window.navigator.clipboard) {
      return window.navigator.clipboard
        .writeText(data);
    } else {
      // console.log('copy exec command use');
      return new Promise((resolve, reject) => {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = data;
          textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in MS Edge.
          textarea.style.opacity = '0'; // Hide the textarea
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          const copyExec = document.execCommand('copy');
          document.body.removeChild(textarea);
          if (copyExec) {
            resolve();
            // alert('copied!');
          } else {
            reject(new Error('copy failed'));
          }
        } catch (err) {
          reject(err);
        }
      });

    }
  }
  export const write = (data: ClipboardItems, clipboard: Clipboard = navigator.clipboard): Promise<void> => {
    return clipboard.write(data);
  }
}