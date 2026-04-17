# Database Schema Proposal

## Users
- `id` (Long, PK)
- `username` (String, Unique)
- `email` (String, Unique)
- `password_hash` (String)
- `avatar_url` (String)
- `bio` (Text)
- `created_at` (Timestamp)

## Snippets
- `id` (Long, PK)
- `owner_id` (Long, FK -> Users.id)
- `title` (String)
- `description` (Text)
- `code` (Text)
- `language` (String)
- `is_public` (Boolean)
- `status` (Enum: DRAFT, PUBLISHED)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

## Tags
- `id` (Long, PK)
- `name` (String, Unique)

## Snippet_Tags (Join Table)
- `snippet_id` (FK -> Snippets.id)
- `tag_id` (FK -> Tags.id)

## Collections
- `id` (Long, PK)
- `owner_id` (FK -> Users.id)
- `name` (String)
- `description` (Text)
- `parent_id` (FK -> Collections.id, nullable)

## Collection_Snippets (Join Table)
- `collection_id` (FK -> Collections.id)
- `snippet_id` (FK -> Snippets.id)

## Comments
- `id` (Long, PK)
- `snippet_id` (FK -> Snippets.id)
- `user_id` (FK -> Users.id)
- `content` (Text)
- `line_number` (Integer, nullable)
- `created_at` (Timestamp)

## Snippet_Versions
- `id` (Long, PK)
- `snippet_id` (FK -> Snippets.id)
- `code` (Text)
- `version_number` (Integer)
- `created_at` (Timestamp)
