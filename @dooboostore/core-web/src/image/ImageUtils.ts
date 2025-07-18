export namespace ImageUtils {

  /**
   * File 객체로부터 이미지의 가로/세로 크기를 비동기적으로 가져옵니다.
   * @param file 이미지 파일
   * @returns Promise<{width: number, height: number}>
   */
// private getImageDimensions(file: File): Promise<{ width: number, height: number }> {
//   return new Promise((resolve, reject) => {
//     const imageUrl = URL.createObjectURL(file);
//     const img = new Image();
//
//     img.onload = () => {
//       resolve({ width: img.width, height: img.height });
//       URL.revokeObjectURL(imageUrl); // 메모리 해제
//     };
//
//     img.onerror = (error) => {
//       reject(error);
//       URL.revokeObjectURL(imageUrl); // 메모리 해제
//     };
//
//     img.src = imageUrl;
//   });
}