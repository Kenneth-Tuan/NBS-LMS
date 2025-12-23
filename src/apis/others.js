import { baseApiHelper } from "@/utils/axios";

export default {
  getCreditFee() {
    return baseApiHelper.get(`/credit-fee`);
  },
  setCreditFee(creditFee) {
    return baseApiHelper.patch(`/credit-fee`, { multiplier: creditFee });
  },
};
