-- Adminer 4.8.1 PostgreSQL 14.15 dump

DROP TABLE IF EXISTS "chat_messages";
DROP SEQUENCE IF EXISTS chat_messages_id_seq;
CREATE SEQUENCE chat_messages_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."chat_messages" (
    "id" integer DEFAULT nextval('chat_messages_id_seq') NOT NULL,
    "chat_id" integer NOT NULL,
    "question_id" integer DEFAULT '0' NOT NULL,
    "role" character varying NOT NULL,
    "message" text NOT NULL,
    "quiz_result" text,
    "used_tokens" integer DEFAULT '0' NOT NULL,
    "reaction_status" character varying(10),
    "intent" character varying(100),
    "files" text,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "chats";
DROP SEQUENCE IF EXISTS chats_id_seq;
CREATE SEQUENCE chats_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."chats" (
    "id" integer DEFAULT nextval('chats_id_seq') NOT NULL,
    "user_id" integer NOT NULL,
    "summary" text,
    "last_message_id" integer DEFAULT '0',
    "used_tokens" bigint DEFAULT '0',
    "generate_summary_tokens" integer DEFAULT '0',
    "title" character varying,
    "description" text,
    "last_summary_timestamp" timestamp,
    "deleted_at" timestamp,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "directories";
DROP SEQUENCE IF EXISTS directories_id_seq;
CREATE SEQUENCE directories_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."directories" (
    "id" integer DEFAULT nextval('directories_id_seq') NOT NULL,
    "user_id" integer NOT NULL,
    "message_id" integer,
    "name" character varying(255) NOT NULL,
    "parent_id" integer DEFAULT '0',
    "type" character varying(20) NOT NULL,
    "deleted_at" timestamp,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "directories_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "jobs";
DROP SEQUENCE IF EXISTS jobs_id_seq;
CREATE SEQUENCE jobs_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."jobs" (
    "id" integer DEFAULT nextval('jobs_id_seq') NOT NULL,
    "payload" text NOT NULL,
    "status" integer DEFAULT '0' NOT NULL,
    "created_at" timestamp NOT NULL,
    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "plans";
DROP SEQUENCE IF EXISTS plans_id_seq;
CREATE SEQUENCE plans_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."plans" (
    "id" integer DEFAULT nextval('plans_id_seq') NOT NULL,
    "name" character varying(255) NOT NULL,
    "duration" character varying(50) NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "stripe_plan_id" character varying(255) NOT NULL,
    CONSTRAINT "plans_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "plans_stripe_plan_id_key" UNIQUE ("stripe_plan_id")
) WITH (oids = false);


DROP TABLE IF EXISTS "quizzes";
DROP SEQUENCE IF EXISTS quizzes_id_seq;
CREATE SEQUENCE quizzes_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

DROP TABLE IF EXISTS "quizzes";
DROP SEQUENCE IF EXISTS quizzes_id_seq;
CREATE SEQUENCE quizzes_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."quizzes" (
    "id" integer DEFAULT nextval('quizzes_id_seq') NOT NULL,
    "chat_message_id" integer NOT NULL,
    "question" text NOT NULL,
    "options" jsonb,
    "correct_answer" text NOT NULL,
    "users_answer" text,
    "is_correct" boolean,
    "explanation" text NOT NULL,
    "created_at" timestamp NOT NULL,
    "updated_at" timestamp NOT NULL,
    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "subscriptions";
DROP SEQUENCE IF EXISTS subscriptions_id_seq;
CREATE SEQUENCE subscriptions_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."subscriptions" (
    "id" integer DEFAULT nextval('subscriptions_id_seq') NOT NULL,
    "user_id" integer,
    "plan_id" integer NOT NULL,
    "is_trial" boolean DEFAULT true,
    "stripe_customer_id" character varying(255),
    "stripe_subscription_id" character varying(255),
    "status" character varying(50) NOT NULL,
    "start_date" timestamp DEFAULT CURRENT_TIMESTAMP,
    "end_date" timestamp,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscriptions_user_id_key" UNIQUE ("user_id")
) WITH (oids = false);


DROP TABLE IF EXISTS "summary_logs";
DROP SEQUENCE IF EXISTS summary_logs_id_seq;
CREATE SEQUENCE summary_logs_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."summary_logs" (
    "id" integer DEFAULT nextval('summary_logs_id_seq') NOT NULL,
    "chatId" integer NOT NULL,
    "summary" text NOT NULL,
    "reason" character varying(50) NOT NULL,
    "debug_info" text,
    "used_tokens" bigint DEFAULT '0',
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "summary_logs_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "token_usage_logs";
DROP SEQUENCE IF EXISTS token_usage_logs_id_seq;
CREATE SEQUENCE token_usage_logs_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."token_usage_logs" (
    "id" integer DEFAULT nextval('token_usage_logs_id_seq') NOT NULL,
    "user_id" integer NOT NULL,
    "module" character varying(255) NOT NULL,
    "tokens_used" integer NOT NULL,
    "request" text,
    "response" text,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "token_usage_logs_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "user_token_usage";
DROP SEQUENCE IF EXISTS user_token_usage_id_seq;
CREATE SEQUENCE user_token_usage_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."user_token_usage" (
    "id" integer DEFAULT nextval('user_token_usage_id_seq') NOT NULL,
    "user_id" integer NOT NULL,
    "usage_date" date NOT NULL,
    "tokens_used" bigint DEFAULT '0',
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_token_usage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_token_usage_user_id_usage_date_key" UNIQUE ("user_id", "usage_date")
) WITH (oids = false);


DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS users_id_seq;
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."users" (
    "id" integer DEFAULT nextval('users_id_seq') NOT NULL,
    "email" character varying NOT NULL,
    "first_name" character varying NOT NULL,
    "last_name" character varying NOT NULL,
    "profile_picture" character varying,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    "subscriptionId" integer,
    CONSTRAINT "users_email_key" UNIQUE ("email"),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
) WITH (oids = false);


ALTER TABLE ONLY "public"."chat_messages" ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."chats" ADD CONSTRAINT "chats_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."quizzes" ADD CONSTRAINT "chat_message_id_fkey" FOREIGN KEY (chat_message_id) REFERENCES chat_messages(id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL NOT DEFERRABLE;

ALTER TABLE ONLY "public"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."summary_logs" ADD CONSTRAINT "summary_logs_chat_id_fkey" FOREIGN KEY ("chatId") REFERENCES chats(id) ON DELETE CASCADE NOT DEFERRABLE;

ALTER TABLE ONLY "public"."users" ADD CONSTRAINT "fk_subscription" FOREIGN KEY ("subscriptionId") REFERENCES subscriptions(id) ON DELETE SET NULL NOT DEFERRABLE;

-- 2025-02-04 15:06:50.05827+05:30