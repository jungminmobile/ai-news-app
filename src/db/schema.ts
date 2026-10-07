import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// user_id는 모두 Clerk 사용자 ID이며, 모든 쿼리는 user_id로 제한한다.

export const categories = pgTable(
  "categories",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    name: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("categories_user_name_unique").on(t.userId, t.name)],
);

export const articles = pgTable(
  "articles",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    url: text().notNull(),
    source: text().notNull(),
    titleEn: text("title_en").notNull(),
    titleKo: text("title_ko").notNull(),
    summaryKo: text("summary_ko").notNull(),
    // null = 미분류. 카테고리 삭제 시 null로 이동한다.
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    savedAt: timestamp("saved_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("articles_user_url_unique").on(t.userId, t.url),
    index("articles_category_id_idx").on(t.categoryId),
  ],
);

export const notionSaves = pgTable(
  "notion_saves",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    articleUrl: text("article_url").notNull(),
    notionPageUrl: text("notion_page_url").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("notion_saves_user_article_idx").on(t.userId, t.articleUrl)],
);

// Notion 인증 방식/토큰 저장은 미정이라 토큰 컬럼은 두지 않는다.
export const userSettings = pgTable("user_settings", {
  userId: text("user_id").primaryKey(),
  notionDatabaseId: text("notion_database_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type NotionSave = typeof notionSaves.$inferSelect;
export type NewNotionSave = typeof notionSaves.$inferInsert;
export type UserSettings = typeof userSettings.$inferSelect;
