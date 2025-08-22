/*
  Warnings:

  - You are about to drop the column `bullets` on the `Internship` table. All the data in the column will be lost.
  - You are about to drop the column `bullets` on the `Position` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Position` table. All the data in the column will be lost.
  - You are about to drop the column `bullets` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `items` on the `Skill` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "InternshipBullet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "internshipId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "InternshipBullet_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internship" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectBullet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "ProjectBullet_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PositionBullet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "positionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "PositionBullet_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SkillItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "skillId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "SkillItem_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Internship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "title" TEXT,
    "location" TEXT,
    "start" TEXT,
    "end" TEXT,
    CONSTRAINT "Internship_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Internship" ("company", "end", "id", "location", "resumeId", "start", "title") SELECT "company", "end", "id", "location", "resumeId", "start", "title" FROM "Internship";
DROP TABLE "Internship";
ALTER TABLE "new_Internship" RENAME TO "Internship";
CREATE TABLE "new_Position" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "org" TEXT,
    "title" TEXT,
    CONSTRAINT "Position_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Position" ("id", "org", "resumeId") SELECT "id", "org", "resumeId" FROM "Position";
DROP TABLE "Position";
ALTER TABLE "new_Position" RENAME TO "Position";
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    CONSTRAINT "Project_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("id", "name", "resumeId", "summary") SELECT "id", "name", "resumeId", "summary" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE TABLE "new_Skill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    CONSTRAINT "Skill_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Skill" ("category", "id", "resumeId") SELECT "category", "id", "resumeId" FROM "Skill";
DROP TABLE "Skill";
ALTER TABLE "new_Skill" RENAME TO "Skill";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
