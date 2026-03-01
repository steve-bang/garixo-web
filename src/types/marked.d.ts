declare module 'marked' {
  export const marked: {
    parse: (
      markdown: string,
      options?: {
        gfm?: boolean;
        breaks?: boolean;
      }
    ) => string | Promise<string>;
  };
}
