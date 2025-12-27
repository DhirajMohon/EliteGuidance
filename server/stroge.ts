import { 
  users, mentors, students, requests, messages,
  type User, type InsertUser, type Mentor, type Student, type Request, type Message 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Mentor
  createMentor(userId: number, data: Partial<Mentor>): Promise<Mentor>;
  getMentorByUserId(userId: number): Promise<Mentor | undefined>;
  getMentors(filters?: { university?: string; expertise?: string }): Promise<(User & { mentor: Mentor })[]>;

  // Student
  createStudent(userId: number, data: Partial<Student>): Promise<Student>;
  getStudentByUserId(userId: number): Promise<Student | undefined>;

  // Requests
  createRequest(request: Partial<Request>): Promise<Request>;
  getRequestsByStudentId(studentId: number): Promise<(Request & { mentor: User })[]>;
  getRequestsByMentorId(mentorId: number): Promise<(Request & { student: User })[]>;
  getRequest(id: number): Promise<Request | undefined>;
  updateRequestStatus(id: number, status: "accepted" | "rejected"): Promise<Request>;
  getAllRequests(): Promise<(Request & { student: User, mentor: User })[]>; // Admin

  // Messages
  createMessage(message: Partial<Message>): Promise<Message>;
  getMessages(requestId: number): Promise<(Message & { sender: User })[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createMentor(userId: number, data: Partial<Mentor>): Promise<Mentor> {
    const [mentor] = await db.insert(mentors).values({ userId, ...data }).returning();
    return mentor;
  }

  async getMentorByUserId(userId: number): Promise<Mentor | undefined> {
    const [mentor] = await db.select().from(mentors).where(eq(mentors.userId, userId));
    return mentor;
  }

  async getMentors(filters?: { university?: string; expertise?: string }): Promise<(User & { mentor: Mentor })[]> {
    // Basic join and filter in memory for prototype simplicity or simple query
    const results = await db.select().from(users)
      .innerJoin(mentors, eq(users.id, mentors.userId));
    
    return results
      .map(({ users, mentors }) => ({ ...users, mentor: mentors }))
      .filter(u => {
        if (filters?.university && !u.mentor.universities?.some(uni => uni.toLowerCase().includes(filters.university!.toLowerCase()))) return false;
        if (filters?.expertise && !u.mentor.expertise?.some(exp => exp.toLowerCase().includes(filters.expertise!.toLowerCase()))) return false;
        return true;
      });
  }

  async createStudent(userId: number, data: Partial<Student>): Promise<Student> {
    const [student] = await db.insert(students).values({ userId, ...data }).returning();
    return student;
  }

  async getStudentByUserId(userId: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student;
  }

  async createRequest(req: Partial<Request>): Promise<Request> {
    const [request] = await db.insert(requests).values(req as any).returning();
    return request;
  }

  async getRequestsByStudentId(studentId: number): Promise<(Request & { mentor: User })[]> {
    const results = await db.select({
      request: requests,
      mentor: users
    })
    .from(requests)
    .innerJoin(users, eq(requests.mentorId, users.id)) // Join to get Mentor User details
    .where(eq(requests.studentId, studentId));

    return results.map(r => ({ ...r.request, mentor: r.mentor }));
  }

  async getRequestsByMentorId(mentorId: number): Promise<(Request & { student: User })[]> {
    const results = await db.select({
      request: requests,
      student: users
    })
    .from(requests)
    .innerJoin(users, eq(requests.studentId, users.id))
    .where(eq(requests.mentorId, mentorId));
    
    return results.map(r => ({ ...r.request, student: r.student }));
  }

  async getRequest(id: number): Promise<Request | undefined> {
    const [request] = await db.select().from(requests).where(eq(requests.id, id));
    return request;
  }

  async updateRequestStatus(id: number, status: "accepted" | "rejected"): Promise<Request> {
    const [updated] = await db.update(requests)
      .set({ status })
      .where(eq(requests.id, id))
      .returning();
    return updated;
  }

  async getAllRequests(): Promise<(Request & { student: User, mentor: User })[]> {
    // For admin
    // Complex join: Request -> Student (User) AND Request -> Mentor (User)
    // Drizzle simplified approach:
    const allRequests = await db.select().from(requests);
    const allUsers = await db.select().from(users);
    
    return allRequests.map(req => {
      const student = allUsers.find(u => u.id === req.studentId)!;
      const mentor = allUsers.find(u => u.id === req.mentorId)!;
      return { ...req, student, mentor };
    });
  }

  async createMessage(msg: Partial<Message>): Promise<Message> {
    const [message] = await db.insert(messages).values(msg as any).returning();
    return message;
  }

  async getMessages(requestId: number): Promise<(Message & { sender: User })[]> {
    const results = await db.select({
      message: messages,
      sender: users
    })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.requestId, requestId))
    .orderBy(messages.createdAt);

    return results.map(r => ({ ...r.message, sender: r.sender }));
  }
}

export const storage = new DatabaseStorage();
