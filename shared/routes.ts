import { z } from 'zod';
import { insertUserSchema, insertRequestSchema, insertMessageSchema, users, mentors, requests, messages } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema.extend({
        // Optional profile data for registration
        universities: z.array(z.string()).optional(),
        expertise: z.array(z.string()).optional(),
        targetUniversities: z.array(z.string()).optional(),
      }),
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  mentors: {
    list: {
      method: 'GET' as const,
      path: '/api/mentors',
      input: z.object({
        university: z.string().optional(),
        expertise: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect & { mentor: typeof mentors.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/mentors/:id',
      responses: {
        200: z.custom<typeof users.$inferSelect & { mentor: typeof mentors.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  requests: {
    list: {
      method: 'GET' as const,
      path: '/api/requests',
      responses: {
        200: z.array(z.custom<typeof requests.$inferSelect & { 
          student?: typeof users.$inferSelect, 
          mentor?: typeof users.$inferSelect 
        }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/requests',
      input: insertRequestSchema.pick({ mentorId: true, message: true }),
      responses: {
        201: z.custom<typeof requests.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/requests/:id/status',
      input: z.object({ status: z.enum(["accepted", "rejected"]) }),
      responses: {
        200: z.custom<typeof requests.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  messages: {
    list: {
      method: 'GET' as const,
      path: '/api/requests/:requestId/messages',
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect & { sender: typeof users.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/requests/:requestId/messages',
      input: z.object({ content: z.string() }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
