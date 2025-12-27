import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const { hashPassword } = setupAuth(app);

  // === AUTH API ===
  
  app.post(api.auth.login.path, (req, res, next) => {
    // passport.authenticate calls res.end() or next(), so we wrap it
    const nextFunc = (err: any, user: any, info: any) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: "Invalid credentials" });
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.json(user);
        });
    };
    // @ts-ignore
    return import("passport").then(p => p.default.authenticate("local", nextFunc)(req, res, next));
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send();
    }
    res.json(req.user);
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
      });

      // Create role specific profile
      if (user.role === 'mentor') {
        await storage.createMentor(user.id, {
          universities: input.universities || [],
          expertise: input.expertise || [],
          bio: "New Mentor Bio"
        });
      } else if (user.role === 'student') {
        await storage.createStudent(user.id, {
          targetUniversities: input.targetUniversities || [],
          testScores: {}
        });
      }

      req.login(user, (err) => {
        if (err) throw err;
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });


  // === APP API ===

  // Middleware to check auth
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    next();
  };

  app.get(api.mentors.list.path, requireAuth, async (req, res) => {
    const filters = req.query as { university?: string; expertise?: string };
    const mentors = await storage.getMentors(filters);
    res.json(mentors);
  });

  app.get(api.mentors.get.path, requireAuth, async (req, res) => {
    const mentorUser = await storage.getUser(Number(req.params.id));
    if (!mentorUser || mentorUser.role !== 'mentor') return res.status(404).send();
    
    const mentorProfile = await storage.getMentorByUserId(mentorUser.id);
    if (!mentorProfile) return res.status(404).send();

    res.json({ ...mentorUser, mentor: mentorProfile });
  });

  app.get(api.requests.list.path, requireAuth, async (req, res) => {
    const user = req.user as any;
    if (user.role === 'student') {
      const requests = await storage.getRequestsByStudentId(user.id);
      return res.json(requests);
    } else if (user.role === 'mentor') {
      const requests = await storage.getRequestsByMentorId(user.id);
      return res.json(requests);
    } else if (user.role === 'admin') {
      const requests = await storage.getAllRequests();
      return res.json(requests);
    }
    res.json([]);
  });

  app.post(api.requests.create.path, requireAuth, async (req, res) => {
    const user = req.user as any;
    if (user.role !== 'student') return res.status(403).json({ message: "Only students can request mentorship" });

    const input = api.requests.create.input.parse(req.body);
    const request = await storage.createRequest({
      studentId: user.id,
      mentorId: input.mentorId,
      message: input.message
    });
    res.status(201).json(request);
  });

  app.patch(api.requests.updateStatus.path, requireAuth, async (req, res) => {
    const user = req.user as any;
    if (user.role !== 'mentor') return res.status(403).json({ message: "Only mentors can update status" });

    const input = api.requests.updateStatus.input.parse(req.body);
    const request = await storage.getRequest(Number(req.params.id));
    
    if (!request) return res.status(404).send();
    if (request.mentorId !== user.id) return res.status(403).send();

    const updated = await storage.updateRequestStatus(request.id, input.status as any);
    res.json(updated);
  });

  app.get(api.messages.list.path, requireAuth, async (req, res) => {
    const messages = await storage.getMessages(Number(req.params.requestId));
    res.json(messages);
  });

  app.post(api.messages.create.path, requireAuth, async (req, res) => {
    const user = req.user as any;
    const input = api.messages.create.input.parse(req.body);
    const request = await storage.getRequest(Number(req.params.requestId));

    if (!request) return res.status(404).send();
    // Only allow if request is accepted and user is involved
    if (request.status !== 'accepted') return res.status(400).json({ message: "Request must be accepted" });
    if (request.studentId !== user.id && request.mentorId !== user.id) return res.status(403).send();

    const message = await storage.createMessage({
      requestId: request.id,
      senderId: user.id,
      content: input.content
    });
    res.status(201).json(message);
  });


  // === SEED DATA ===
  const existingUsers = await storage.getUserByUsername("student1");
  if (!existingUsers) {
    console.log("Seeding database...");
    const hashed = await hashPassword("password123");
    
    // Mentor
    const mentor = await storage.createUser({
        username: "mentor1",
        password: hashed,
        role: "mentor",
        name: "Dr. Alan Grant",
        email: "alan@jurassic.com"
    });
    await storage.createMentor(mentor.id, {
        universities: ["Harvard", "Yale"],
        expertise: ["Paleontology", "Biology"],
        bio: "Expert in dinosaur genetics and admissions."
    });

    const mentor2 = await storage.createUser({
        username: "mentor2",
        password: hashed,
        role: "mentor",
        name: "Ada Lovelace",
        email: "ada@compute.com"
    });
    await storage.createMentor(mentor2.id, {
        universities: ["MIT", "Stanford"],
        expertise: ["Computer Science", "Math"],
        bio: "First computer programmer. I can help with CS apps."
    });

    // Student
    const student = await storage.createUser({
        username: "student1",
        password: hashed,
        role: "student",
        name: "Tim Murphy",
        email: "tim@jurassic.com"
    });
    await storage.createStudent(student.id, {
        targetUniversities: ["MIT"],
        testScores: { SAT: 1450 }
    });

    // Admin
    await storage.createUser({
        username: "admin",
        password: hashed,
        role: "admin",
        name: "Admin User",
        email: "admin@elite.com"
    });

    console.log("Database seeded!");
  }

  return httpServer;
}
