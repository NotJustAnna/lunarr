/*
  Warnings:

  - The values [AWAITING_APPROVAL,APPROVED_REQUEST,DECLINED_REQUEST,PARTIALLY_AVAILABLE] on the enum `OmbiRequestDataState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OmbiRequestDataState_new" AS ENUM ('NONE', 'PENDING_APPROVAL', 'REQUEST_DENIED', 'PROCESSING_REQUEST', 'AVAILABLE');
ALTER TABLE "Movie" ALTER COLUMN "movi_ombi_request_state" DROP DEFAULT;
ALTER TABLE "ShowEpisode" ALTER COLUMN "shep_ombi_request_state" DROP DEFAULT;
ALTER TABLE "Movie" ALTER COLUMN "movi_ombi_request_state" TYPE "OmbiRequestDataState_new" USING ("movi_ombi_request_state"::text::"OmbiRequestDataState_new");
ALTER TABLE "ShowEpisode" ALTER COLUMN "shep_ombi_request_state" TYPE "OmbiRequestDataState_new" USING ("shep_ombi_request_state"::text::"OmbiRequestDataState_new");
ALTER TYPE "OmbiRequestDataState" RENAME TO "OmbiRequestDataState_old";
ALTER TYPE "OmbiRequestDataState_new" RENAME TO "OmbiRequestDataState";
DROP TYPE "OmbiRequestDataState_old";
ALTER TABLE "Movie" ALTER COLUMN "movi_ombi_request_state" SET DEFAULT 'NONE';
ALTER TABLE "ShowEpisode" ALTER COLUMN "shep_ombi_request_state" SET DEFAULT 'NONE';
COMMIT;
