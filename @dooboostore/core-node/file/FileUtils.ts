import * as os from 'node:os';
import { RandomUtils } from '@dooboostore/core/random/RandomUtils';
import * as fs from 'node:fs';

export namespace FileUtils {
  export class File {
    public size: number | undefined;

    constructor(private _data: {
      path: string,
      originalName?: string,
    }) {

      this.updateStats();
    }

    get originalName(): string {
      return this._data.originalName;
    }
    get directory(): string {
      return this._data.path.substring(0, this._data.path.lastIndexOf('/'));
    }
    get fileName(): string {
      return this._data.path.substring(this._data.path.lastIndexOf('/') + 1);
    }
    get path(): string {
      return this._data.path;
    }
    get extension(): string {
      const ext = this._data.path.substring(this._data.path.lastIndexOf('.') + 1);
      return ext.length > 0 ? ext : undefined;
    }
    async updateStats(): Promise<void> {
      const stats = await fs.promises.stat(this._data.path);
      this.size = stats.size;
    }

    async delete(): Promise<void> {
      await fs.promises.unlink(this._data.path);
      this._data.path = '';
      this.size = undefined;
    }


    async copy(newPath: string): Promise<void> {
      await fs.promises.copyFile(this._data.path, newPath);
      this._data.path = newPath;
      this.size = (await fs.promises.stat(newPath)).size;
    }

    // path에 파일명도있어야된다!!
    async move(newPath: string): Promise<void> {
      // newPath의 디렉토리가 없으면 생성
      const dir = newPath.substring(0, newPath.lastIndexOf('/'));
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.rename(this._data.path, newPath);
      this._data.path = newPath;
      this.size = (await fs.promises.stat(newPath)).size;
    }

    async rename(newName: string): Promise<void> {
      const dir = this.directory;
      const newPath = `${dir}/${newName}`;
      await fs.promises.rename(this._data.path, newPath);
      this.size = (await fs.promises.stat(newPath)).size;
      this._data.path = newPath;
    }
  }

  export const writeFile = async (buffer: Buffer, config: {path?: string, originalName?: string}) => {
    config.path??= `${os.tmpdir()}/${RandomUtils.uuid4()}_${Date.now()}`;
    await fs.promises.mkdir(config.path.substring(0, config.path.lastIndexOf('/')), { recursive: true });
    await fs.promises.writeFile(config.path, buffer);
    return new File({ path: config.path, originalName: config.originalName });
    // console.log(`파일 저장 완료: ${tempFilePath}`);
  }
}