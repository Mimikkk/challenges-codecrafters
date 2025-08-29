export enum LogLevel {
  Silent = 0,
  Error = 1,
  Warn = 2,
  Info = 3,
  Debug = 4,
}

export class Logger {
  static new(level: LogLevel, defaultLevel: LogLevel = LogLevel.Info) {
    return new Logger(level, defaultLevel);
  }

  private constructor(
    public level: LogLevel,
    public readonly defaultLevel: LogLevel,
  ) {}

  error(message: string, ...args: unknown[]): void {
    if (this.level < LogLevel.Error) return;
    console.error(message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.level < LogLevel.Warn) return;
    console.warn(message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    if (this.level < LogLevel.Info) return;
    console.info(message, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.level < LogLevel.Debug) return;
    console.debug(message, ...args);
  }

  silence(): void {
    this.level = LogLevel.Silent;
  }

  restore(): void {
    this.level = this.defaultLevel;
  }
}

export const logger = Logger.new(LogLevel.Info, LogLevel.Info);
