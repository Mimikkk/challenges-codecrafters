export interface CommandOptions<TOptions extends Record<string, string>> {
  name: string;
  description: string;
  options: Record<keyof TOptions, { type: string; required: boolean }>;
  onInvoke: (options: TOptions) => Promise<void>;
}

export class Command<TOptions extends Record<string, string>> {
  static new<TOptions extends Record<string, string>>(
    { name, description, options, onInvoke }: CommandOptions<TOptions>,
  ): Command<TOptions> {
    return new Command<TOptions>(name, description, options, onInvoke);
  }

  private constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly options: Record<keyof TOptions, { type: string; required: boolean }>,
    private readonly onInvoke: (options: TOptions) => Promise<void>,
  ) {}

  async invoke(options: TOptions): Promise<void> {
    return await this.onInvoke(options);
  }
}
