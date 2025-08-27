// src/types.d.ts

declare module 'mammoth' {
  interface ConversionResult {
    value: string;
    messages: any[];
  }

  interface Options {
    path?: string;
    buffer?: Buffer;
  }

  function extractRawText(options: Options): Promise<ConversionResult>;

  const mammoth: {
    extractRawText: typeof extractRawText;
  };

  export = mammoth;
}
