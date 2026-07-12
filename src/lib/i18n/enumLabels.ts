import { MILITARY_RANKS, CLEARANCE_LEVELS } from "@/lib/schema";
import type { Translate, TranslationKey } from "./translate";

export const RANK_LABEL_KEYS: Record<(typeof MILITARY_RANKS)[number], TranslationKey> = {
  Private: "ranks.private",
  "Senior Private": "ranks.seniorPrivate",
  "Junior Sergeant": "ranks.juniorSergeant",
  Sergeant: "ranks.sergeant",
  "Senior Sergeant": "ranks.seniorSergeant",
  "Chief Sergeant": "ranks.chiefSergeant",
  "Staff Sergeant": "ranks.staffSergeant",
  "Master Sergeant": "ranks.masterSergeant",
  "Senior Master Sergeant": "ranks.seniorMasterSergeant",
  "Chief Master Sergeant": "ranks.chiefMasterSergeant",
  "Junior Lieutenant": "ranks.juniorLieutenant",
  Lieutenant: "ranks.lieutenant",
  "Senior Lieutenant": "ranks.seniorLieutenant",
  Captain: "ranks.captain",
  Major: "ranks.major",
  "Lieutenant Colonel": "ranks.lieutenantColonel",
  Colonel: "ranks.colonel",
  "Brigadier General": "ranks.brigadierGeneral",
  "Major General": "ranks.majorGeneral",
  "Lieutenant General": "ranks.lieutenantGeneral",
  General: "ranks.general",
};

export const CLEARANCE_LABEL_KEYS: Record<(typeof CLEARANCE_LEVELS)[number], TranslationKey> = {
  "No clearance": "clearanceLevels.none",
  "For official use only": "clearanceLevels.officialUseOnly",
  Secret: "clearanceLevels.secret",
  "Top secret": "clearanceLevels.topSecret",
  "Special importance": "clearanceLevels.specialImportance",
};

export function translateRank(t: Translate, rank: string): string {
  const key = RANK_LABEL_KEYS[rank as (typeof MILITARY_RANKS)[number]];
  return key ? t(key) : rank;
}

export function translateClearance(t: Translate, level: string): string {
  const key = CLEARANCE_LABEL_KEYS[level as (typeof CLEARANCE_LEVELS)[number]];
  return key ? t(key) : level;
}
