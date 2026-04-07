import { type ZodType } from 'zod';
import { type Request, type Response, type NextFunction } from 'express';

type DataType = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodType, dataType: DataType = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[dataType]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: result.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    // Assign validated & sanitized data
    req[dataType] = result.data;
    next();
  };
