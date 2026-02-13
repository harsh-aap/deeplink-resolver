import { Request, Response, NextFunction } from 'express';
import { DeeplinkService } from '../deeplink.service';

const deeplinkService = new DeeplinkService(); // instantiate the service

// ---------------------------------------------------
// Resolve Deeplink
// Equivalent of GET /deeplink/d/:code
// ---------------------------------------------------
export const resolveDeeplink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Route hit, client IP:", req.ip);

    const destination = await deeplinkService.resolveDeeplink({
      code: req.params.code as string || '',
      ip: req.ip || '',
      userAgent: req.headers['user-agent'] as string,
    });

    // Redirect user to the destination URL
    res.redirect(destination);
  } catch (error) {
    next(error); // forward errors to error-handling middleware
  }
};

// ---------------------------------------------------
// Track Conversion
// Equivalent of POST /deeplink/conversion
// ---------------------------------------------------
export const trackConversion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await deeplinkService.trackConversion(req.body);
    res.json(result); // return JSON response
  } catch (error) {
    next(error); // forward errors to error-handling middleware
  }
};
