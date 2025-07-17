/// <reference types="vite/client" />

// 安全的環境變數訪問
const getEnv = () => {
  try {
    return import.meta.env;
  } catch {
    return {
      DEV: process.env.NODE_ENV === "development",
      PROD: process.env.NODE_ENV === "production",
    };
  }
};

// 功能開關接口定義
export interface FeatureFlags {
  // 成績簿相關功能
  gradebook: {
    enableWeightConfiguration: boolean; // 權重配置功能
    enableCustomColumns: boolean; // 自定義欄位功能
    enableAdvancedGrading: boolean; // 高級評分功能
  };

  // 課程管理功能
  courseManagement: {
    enableBulkOperations: boolean; // 批量操作功能
    enableAdvancedFilters: boolean; // 高級篩選功能
    enableExportFeatures: boolean; // 匯出功能
  };

  // 用戶管理功能
  userManagement: {
    enableBulkUserImport: boolean; // 批量用戶匯入
    enableRoleManagement: boolean; // 角色管理
    enableUserAnalytics: boolean; // 用戶分析
  };

  // 通知系統功能
  notifications: {
    enablePushNotifications: boolean; // 推送通知
    enableEmailNotifications: boolean; // 郵件通知
    enableInAppNotifications: boolean; // 應用內通知
  };

  // 實驗性功能
  experimental: {
    enableBetaFeatures: boolean; // Beta 功能
    enableDebugMode: boolean; // 調試模式
    enablePerformanceMonitoring: boolean; // 性能監控
  };
}

// 預設功能開關配置
const defaultFeatureFlags: FeatureFlags = {
  gradebook: {
    enableWeightConfiguration: false, // 暫時關閉權重配置
    enableCustomColumns: true, // 開啟自定義欄位
    enableAdvancedGrading: false, // 暫時關閉高級評分
  },

  courseManagement: {
    enableBulkOperations: false, // 暫時關閉批量操作
    enableAdvancedFilters: true, // 開啟高級篩選
    enableExportFeatures: false, // 暫時關閉匯出功能
  },

  userManagement: {
    enableBulkUserImport: false, // 暫時關閉批量匯入
    enableRoleManagement: true, // 開啟角色管理
    enableUserAnalytics: false, // 暫時關閉用戶分析
  },

  notifications: {
    enablePushNotifications: false, // 暫時關閉推送通知
    enableEmailNotifications: true, // 開啟郵件通知
    enableInAppNotifications: true, // 開啟應用內通知
  },

  experimental: {
    enableBetaFeatures: false, // 關閉 Beta 功能
    enableDebugMode: getEnv().DEV, // 開發環境啟用調試
    enablePerformanceMonitoring: false, // 關閉性能監控
  },
};

// 環境變數覆蓋配置
const getEnvironmentOverrides = (): Partial<FeatureFlags> => {
  const overrides: any = {};

  // 從環境變數讀取配置覆蓋
  // 例如: VITE_FEATURE_GRADEBOOK_WEIGHT=true
  const env = getEnv();

  // 解析環境變數
  Object.keys(env).forEach((key) => {
    if (key.startsWith("VITE_FEATURE_")) {
      const path = key.replace("VITE_FEATURE_", "").toLowerCase().split("_");
      const value = env[key] === "true";

      // 構建嵌套對象路徑
      let current = overrides;
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
    }
  });

  return overrides;
};

// 深度合併對象
const deepMerge = (target: any, source: any): any => {
  const result = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
};

// 最終的功能開關配置
export const featureFlags: FeatureFlags = deepMerge(
  defaultFeatureFlags,
  getEnvironmentOverrides()
);

// 輔助函數：檢查功能是否啟用
export const isFeatureEnabled = (path: string): boolean => {
  const keys = path.split(".");
  let current: any = featureFlags;

  for (const key of keys) {
    if (current[key] === undefined) {
      console.warn(`Feature flag path '${path}' not found`);
      return false;
    }
    current = current[key];
  }

  return Boolean(current);
};

// 輔助函數：獲取功能開關狀態
export const getFeatureFlag = (path: string): boolean => {
  return isFeatureEnabled(path);
};

// 開發時的功能開關管理器
export const FeatureFlagManager = {
  // 獲取所有功能開關
  getAll: (): FeatureFlags => featureFlags,

  // 檢查單個功能
  isEnabled: isFeatureEnabled,

  // 獲取功能狀態
  get: getFeatureFlag,

  // 列出所有可用的功能路徑
  listAvailableFlags: (): string[] => {
    const flags: string[] = [];

    const traverse = (obj: any, prefix = ""): void => {
      Object.keys(obj).forEach((key) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === "boolean") {
          flags.push(path);
        } else if (typeof obj[key] === "object") {
          traverse(obj[key], path);
        }
      });
    };

    traverse(featureFlags);
    return flags.sort();
  },

  // 開發模式下的調試信息
  debug: (): void => {
    if (getEnv().DEV) {
      console.group("🚩 Feature Flags Status");
      console.table(featureFlags);
      console.groupEnd();
    }
  },
};

// 在開發環境下自動顯示功能開關狀態
if (getEnv().DEV) {
  console.log("🚩 Feature Flags initialized");
  FeatureFlagManager.debug();
}
