import { knex } from "../knex";
import uuid from "../utils/uuid";

export default async function createProject({ createdBy, title }: { createdBy: string, title: string }) {
  const projectId = uuid();
  await knex("projects").insert({
    createdBy,
    projectId,
    title,
  });
  return projectId;
}
