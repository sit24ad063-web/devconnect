// Shared domain types + API contract for DevConnect.
// Imported by both /server and /client so request/response shapes never drift.

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
}

export type ConnectionStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  githubId: string | null;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  repoUrl: string | null;
  demoUrl: string | null;
  imageUrl: string | null;
  techStack: string | null;
  featured: boolean;
  ownerId: string;
  owner?: Pick<PublicUser, "id" | "name" | "avatarUrl" | "headline">;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown source
  coverImage: string | null;
  tags: string | null;
  published: boolean;
  authorId: string;
  author?: Pick<PublicUser, "id" | "name" | "avatarUrl" | "headline">;
  likeCount?: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author?: Pick<PublicUser, "id" | "name" | "avatarUrl">;
  createdAt: string;
}

export interface Connection {
  id: string;
  status: ConnectionStatus;
  requesterId: string;
  addresseeId: string;
  requester?: Pick<PublicUser, "id" | "name" | "avatarUrl" | "headline">;
  addressee?: Pick<PublicUser, "id" | "name" | "avatarUrl" | "headline">;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  skill: Skill;
  endorsementCount: number;
  endorsedByMe: boolean;
}

export interface Endorsement {
  id: string;
  userSkillId: string;
  endorserId: string;
  createdAt: string;
}

export type NotificationType =
  | "CONNECTION_REQUEST"
  | "CONNECTION_ACCEPTED"
  | "ENDORSEMENT";

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  actorId: string;
  actor?: Pick<PublicUser, "id" | "name" | "avatarUrl">;
  createdAt: string;
}

export interface DashboardStats {
  connectionCount: number;
  projectCount: number;
  postCount: number;
  endorsementsReceived: number;
}

export interface DashboardData {
  stats: DashboardStats;
  activityFeed: Array<
    | { type: "post"; item: Post }
    | { type: "project"; item: Project }
  >;
  connectionSuggestions: PublicUser[];
  trendingPosts: Post[];
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Socket.io event payloads shared between server emit + client listen
export interface ServerToClientEvents {
  notification: (notification: AppNotification) => void;
}

export interface ClientToServerEvents {
  // reserved for future client-initiated realtime events
}
