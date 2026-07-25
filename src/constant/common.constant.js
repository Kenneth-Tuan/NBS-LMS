const DEPARTMENT_OPTIONS = Object.freeze([
  {
    label: "道學碩士",
    value: "master_of_divinity",
  },
  {
    label: "基督教研究碩士",
    value: "master_of_christian_studies",
  },
  {
    label: "神學學士",
    value: "bachelor_of_theology",
  },
  {
    label: "信徒領袖科",
    value: "lay_leadership_program",
  },
  {
    label: "拿會按牧必修",
    value: "pastoral_program",
  },
]);

const DEPARTMENTS_LABEL_MAP = Object.freeze({
  master_of_divinity: "道學碩士",
  master_of_christian_studies: "基督教研究碩士",
  bachelor_of_theology: "神學學士",
  lay_leadership_program: "信徒領袖科",
  pastoral_program: "拿會按牧必修",
});

// 查無科別時套用的及格門檻。
// 注意：與 DEPARTMENT_PASS_SCORE_MAP 中同為 60 的科別意義不同 —— 對照表中的 60 是
// 刻意設定，此處的 60 是查不到科別時的回退值。
const DEFAULT_PASS_SCORE = 60;

const DEPARTMENT_PASS_SCORE_MAP = Object.freeze({
  master_of_divinity: 70,
  master_of_christian_studies: 70,
  bachelor_of_theology: 60,
  lay_leadership_program: 60,
  pastoral_program: 60,
});

export {
  DEPARTMENT_OPTIONS,
  DEPARTMENTS_LABEL_MAP,
  DEPARTMENT_PASS_SCORE_MAP,
  DEFAULT_PASS_SCORE,
};
