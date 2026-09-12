import "server-only";

export {
  listAdminCurriculums,
  listPublicCurriculums,
  listActiveDegreeLevels,
  listEducationLevels,
  listCurriculumMajors,
  getCurriculumById,
  type CurriculumDto,
  type CurriculumMajorDto,
  type EducationLevelDto,
} from "./_internal/services";
export { CURRICULUM_P, CURRICULUM_PERMISSIONS } from "./permissions";

