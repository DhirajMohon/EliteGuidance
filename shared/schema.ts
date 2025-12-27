import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "mentor", "admin"] }).notNull().default("student"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mentors = pgTable("mentors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  universities: text("universities").array(), // PostgreSQL array
  expertise: text("expertise").array(),
  bio: text("bio"),
  rating: integer("rating").default(5),
  availability: boolean("availability").default(true),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  targetUniversities: text("target_universities").array(),
  testScores: jsonb("test_scores"), // e.g. { SAT: 1500, ACT: 34 }
});

export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id), // Link to user for simplicity in this prototype
  mentorId: integer("mentor_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  status: text("status", { enum: ["pending", "accepted", "rejected"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull().references(() => requests.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ one, many }) => ({
  mentorProfile: one(mentors, {
    fields: [users.id],
    references: [mentors.userId],
  }),
  studentProfile: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  sentRequests: many(requests, { relationName: "studentRequests" }),
  receivedRequests: many(requests, { relationName: "mentorRequests" }),
}));

export const requestsRelations = relations(requests, ({ one, many }) => ({
  student: one(users, {
    fields: [requests.studentId],
    references: [users.id],
    relationName: "studentRequests",
  }),
  mentor: one(users, {
    fields: [requests.mentorId],
    references: [users.id],
    relationName: "mentorRequests",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  request: one(requests, {
    fields: [messages.requestId],
    references: [requests.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// === SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertMentorSchema = createInsertSchema(mentors).omit({ id: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertRequestSchema = createInsertSchema(requests).omit({ id: true, createdAt: true, status: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

// === TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Mentor = typeof mentors.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Request = typeof requests.$inferSelect;
export type Message = typeof messages.$inferSelect;
