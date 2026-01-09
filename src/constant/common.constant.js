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

export { DEPARTMENT_OPTIONS, DEPARTMENTS_LABEL_MAP };
