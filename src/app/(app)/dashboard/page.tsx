"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Newspaper,
  MessageSquare,
  BarChart,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/* ----------------------------- Types ----------------------------- */
interface Post {
  id: string;
  title: string;
  content: string;
  author?: string;
  createdAtISO: string; // normalized ISO
}

interface UserDoc {
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}

interface CommentDoc {
  id: string;
  postId: string;
  author?: string;
  text?: string;
  createdAtISO: string; // normalized ISO
}

interface LikeDoc {
  id: string;
  postId: string;
  user?: string;
  createdAtISO: string; // normalized ISO
}

type Activity =
  | {
      type: "post";
      id: string;
      title: string;
      author: string;
      createdAtISO: string;
    }
  | {
      type: "comment";
      id: string;
      postId: string;
      author: string;
      text: string;
      createdAtISO: string;
    }
  | {
    type: "like";
    id: string;
    postId: string;
    user: string;
    createdAtISO: string;
  };

/* ------------------------ Date Normalization --------------------- */
/** Convert Firestore Timestamp / {seconds,nanoseconds} / number / string / Date to Date */
function toDate(input: any): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(+input) ? null : input;

  // Firestore Timestamp has a toDate()
  if (typeof input === "object" && typeof input.toDate === "function") {
    const d = input.toDate();
    return isNaN(+d) ? null : d;
  }

  // Firestore FieldValue-like { seconds, nanoseconds }
  if (
    typeof input === "object" &&
    typeof input.seconds === "number" &&
    (typeof input.nanoseconds === "number" || input.nanoseconds === undefined)
  ) {
    const millis =
      input.seconds * 1000 + Math.floor((input.nanoseconds ?? 0) / 1e6);
    const d = new Date(millis);
    return isNaN(+d) ? null : d;
  }

  if (typeof input === "number" || typeof input === "string") {
    const d = new Date(input);
    return isNaN(+d) ? null : d;
  }

  return null;
}

function toISO(input: any): string {
  const d = toDate(input) ?? new Date();
  return d.toISOString();
}

function relative(iso: string): string {
  const d = new Date(iso);
  if (isNaN(+d)) return "some time ago";
  return formatDistanceToNow(d, { addSuffix: true });
}

/* ------------------------------ UI ------------------------------ */
export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [comments, setComments] = useState<CommentDoc[]>([]);
  const [likes, setLikes] = useState<LikeDoc[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);

  useEffect(() => {
    const run = async () => {
      // POSTS
      const postsSnap = await getDocs(collection(db, "posts"));
      const postsData: Post[] = postsSnap.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          title: data.title ?? "(untitled)",
          content: data.content ?? "",
          author: data.author ?? data.authorName ?? "Unknown",
          createdAtISO: toISO(data.createdAt ?? data.created_at ?? data.createdOn),
        };
      });
      setPosts(postsData);

      // USERS (for subscribers count)
      const usersSnap = await getDocs(collection(db, "users"));
      const usersData: UserDoc[] = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setUsers(usersData);

      // COMMENTS
      const commentsSnap = await getDocs(collection(db, "comments"));
      const commentsData: CommentDoc[] = commentsSnap.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          postId: data.postId ?? data.postID ?? "",
          author: data.author ?? data.user ?? "Unknown",
          text: data.text ?? data.content ?? "",
          createdAtISO: toISO(data.createdAt ?? data.created_on),
        };
      });
      setComments(commentsData);

      // LIKES
      const likesSnap = await getDocs(collection(db, "likes"));
      const likesData: LikeDoc[] = likesSnap.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          postId: data.postId ?? data.postID ?? "",
          user: data.user ?? data.userName ?? "Someone",
          createdAtISO: toISO(data.createdAt ?? data.likedAt),
        };
      });
      setLikes(likesData);

      // ACTIVITY FEED (merge + sort)
      const activityFeed: Activity[] = [
        ...postsData.map((p) => ({
          type: "post",
          id: p.id,
          title: p.title,
          author: p.author ?? "Unknown",
          createdAtISO: p.createdAtISO,
        })),
        ...commentsData.map((c) => ({
          type: "comment",
          id: c.id,
          postId: c.postId,
          author: c.author ?? "Unknown",
          text: c.text ?? "",
          createdAtISO: c.createdAtISO,
        })),
        ...likesData.map((l) => ({
          type: "like",
          id: l.id,
          postId: l.postId,
          user: l.user ?? "Someone",
          createdAtISO: l.createdAtISO,
        })),
      ];

      activityFeed.sort(
        (a, b) =>
          new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime()
      );

      setActivity(activityFeed);
    };

    run();
  }, []);

  const stats = [
    {
      title: "Total Posts",
      value: posts.length.toString(),
      icon: <Newspaper className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: "Subscribers",
      value: users.length.toString(),
      icon: <Users className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: "Comments",
      value: comments.length.toString(),
      icon: <MessageSquare className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: "Likes",
      value: likes.length.toString(),
      icon: <BarChart className="h-6 w-6 text-muted-foreground" />, // or <ThumbsUp />
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
              {s.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Posts, Comments, and Likes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activity.slice(0, 8).map((act) => (
            <div
              key={act.id}
              className="flex items-start space-x-3 border-b last:border-0 pb-3 last:pb-0"
            >
              {act.type === "post" && (
                <Newspaper className="h-5 w-5 text-muted-foreground mt-1" />
              )}
              {act.type === "comment" && (
                <MessageSquare className="h-5 w-5 text-muted-foreground mt-1" />
              )}
              {act.type === "like" && (
                <ThumbsUp className="h-5 w-5 text-muted-foreground mt-1" />
              )}

              <div className="flex-1">
                {act.type === "post" && (
                  <p>
                    <span className="font-semibold">{act.author}</span> created a
                    post: <span className="italic">{act.title}</span>
                  </p>
                )}
                {act.type === "comment" && (
                  <p>
                    <span className="font-semibold">{act.author}</span>{" "}
                    commented:{" "}
                    <span className="italic">"{act.text ?? ""}"</span>
                  </p>
                )}
                {act.type === "like" && (
                  <p>
                    <span className="font-semibold">{act.user}</span> liked a
                    post
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {relative(act.createdAtISO)}
                </p>
              </div>
            </div>
          ))}
          {activity.length === 0 && (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Posts (kept separate so it differs from Activity) */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
          <CardDescription>Your 5 most recently created posts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {posts.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className="p-3 border rounded-lg hover:bg-muted/40 transition"
            >
              <p className="font-semibold">{p.title}</p>
              <p className="text-xs text-muted-foreground">
                {relative(p.createdAtISO)}
              </p>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-sm text-muted-foreground">No posts yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
