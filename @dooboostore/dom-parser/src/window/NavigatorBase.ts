export class NavigatorBase implements Navigator {
  // ── Identity / branding ──────────────────────────────────────────────────
  appCodeName: string = 'Mozilla';
  appName: string = 'Netscape';
  appVersion: string = '5.0 (Server-Side Rendering)';
  product: string = 'Gecko';
  productSub: string = '20100101';
  vendor: string = '';
  vendorSub: string = '';
  userAgent: string = 'Mozilla/5.0 (Server-Side Rendering)';
  platform: string = 'Server';

  // ── Language / locale ────────────────────────────────────────────────────
  language: string = 'en-US';
  languages: readonly string[] = ['en-US', 'en'];

  // ── Connectivity ─────────────────────────────────────────────────────────
  cookieEnabled: boolean = false;
  onLine: boolean = true;
  webdriver: boolean = false;

  // ── Hardware concurrency ─────────────────────────────────────────────────
  hardwareConcurrency: number = 1;
  maxTouchPoints: number = 0;

  // ── Feature flags ────────────────────────────────────────────────────────
  pdfViewerEnabled: boolean = false;

  // ── Stub interfaces (not meaningful in SSR) ──────────────────────────────
  clipboard: Clipboard = undefined as unknown as Clipboard;
  credentials: CredentialsContainer = undefined as unknown as CredentialsContainer;
  doNotTrack: string = '';
  geolocation: Geolocation = undefined as unknown as Geolocation;
  login: NavigatorLogin = undefined as unknown as NavigatorLogin;
  mediaCapabilities: MediaCapabilities = undefined as unknown as MediaCapabilities;
  mediaDevices: MediaDevices = undefined as unknown as MediaDevices;
  mediaSession: MediaSession = undefined as unknown as MediaSession;
  permissions: Permissions = undefined as unknown as Permissions;
  serviceWorker: ServiceWorkerContainer = undefined as unknown as ServiceWorkerContainer;
  userActivation: UserActivation = undefined as unknown as UserActivation;
  wakeLock: WakeLock = undefined as unknown as WakeLock;
  locks: LockManager = undefined as unknown as LockManager;
  mimeTypes: MimeTypeArray = undefined as unknown as MimeTypeArray;
  plugins: PluginArray = undefined as unknown as PluginArray;
  storage: StorageManager = undefined as unknown as StorageManager;

  // ── Methods ──────────────────────────────────────────────────────────────
  canShare(_data?: ShareData): boolean {
    return false;
  }

  getGamepads(): (Gamepad | null)[] {
    return [];
  }

  javaEnabled(): boolean {
    return false;
  }

  registerProtocolHandler(_scheme: string, _url: string | URL): void {}

  requestMIDIAccess(_options?: MIDIOptions): Promise<MIDIAccess> {
    return Promise.resolve({} as MIDIAccess);
  }

  requestMediaKeySystemAccess(
    _keySystem: string,
    _supportedConfigurations: MediaKeySystemConfiguration[]
  ): Promise<MediaKeySystemAccess> {
    return Promise.resolve({} as MediaKeySystemAccess);
  }

  sendBeacon(_url: string | URL, _data?: BodyInit | null): boolean {
    return false;
  }

  share(_data?: ShareData): Promise<void> {
    return Promise.resolve();
  }

  vibrate(_pattern: VibratePattern | Iterable<number>): boolean {
    return false;
  }

  clearAppBadge(): Promise<void> {
    return Promise.resolve();
  }

  setAppBadge(_contents?: number): Promise<void> {
    return Promise.resolve();
  }
}
