// Augments Express's Request type so req.user is typed everywhere
// after the auth middleware runs.
import "express";
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export {};
