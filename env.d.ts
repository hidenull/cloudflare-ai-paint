declare global {
    namespace NodeJS {
      interface ProcessEnv {
        AI: any;
        KV: any;
      }
    }
  }
  
  export {};