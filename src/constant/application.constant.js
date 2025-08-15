import { ApplicationType, ApplicationStatus } from "../enums/appEnums";

const SUBSIDY_TYPE = {
  type1: "學費補助",
  type2: "住宿補助",
  type3: "交通補助",
  type4: "其他補助",
  undefined: "未知補助",
};

const APPLICATION_TYPE_COLOR = {
  [ApplicationType.Internship]: "cyan",
  [ApplicationType.Leave]: "purple",
  [ApplicationType.Subsidy]: "orange",
  [ApplicationType.Others]: "pink",
  undefined: "gray",
};

const APPLICATION_TYPE_TEXT = {
  [ApplicationType.Internship]: "實習申請",
  [ApplicationType.Leave]: "請假申請",
  [ApplicationType.Subsidy]: "補助申請",
  [ApplicationType.Others]: "其他申請",
  undefined: "未知類型",
};

const APPLICATION_STATUS_COLOR = {
  [ApplicationStatus.Pending]: "blue",
  [ApplicationStatus.Approved]: "green",
  [ApplicationStatus.Rejected]: "red",
  undefined: "gray",
};

const APPLICATION_STATUS_TEXT = {
  [ApplicationStatus.Pending]: "待審核",
  [ApplicationStatus.Approved]: "已通過",
  [ApplicationStatus.Rejected]: "已駁回",
  undefined: "未知狀態",
};

export { SUBSIDY_TYPE, APPLICATION_TYPE_COLOR, APPLICATION_TYPE_TEXT, APPLICATION_STATUS_COLOR, APPLICATION_STATUS_TEXT };