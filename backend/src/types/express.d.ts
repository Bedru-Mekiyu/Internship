declare global {
  namespace Express {
    namespace Multer {
      interface File {
        key?: string;
        location?: string;
      }
    }

    interface Request {
      user?: any;
    }
  }
}

export {};
