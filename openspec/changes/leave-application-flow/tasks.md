## 1. 準備 PDF 範本與基礎建設

- [ ] 1.1 將 `學生請假單-空白114.doc` 轉換為 `blankedLeaveApplication.pdf` 並放置於 `public/` 目錄。
- [ ] 1.2 建立 `src/config/leaveApplicationPdfConfig.js`，定義請假單各欄位（學號、姓名、科系、請假原因、課程、假別、日期、節數等）在 PDF 上的座標。
- [ ] 1.3 建立 `src/composables/useLeaveApplicationPdf.js`，實作讀取範本、填入資料、處理老師簽名浮水印的邏輯，並提供 `downloadPdf` 方法。

## 2. 擴充表單與狀態管理 (Frontend)

- [ ] 2.1 修改 `src/schemas/leaveApplication.schema.js`，加入 `leave_periods` (請假節數) 等新欄位的驗證規則與對映。
- [ ] 2.2 修改 `src/stores/application.js`，在 `leaveApplicationForm` 狀態與提交邏輯中納入新欄位。
- [ ] 2.3 修改 `src/views/Applications/LeaveApplication.vue`，在介面上新增讓學生填寫請假節數的輸入框。

## 3. 下載與審核整合

- [ ] 3.1 修改 `src/views/Applications/components/ApplicationList.vue`，在請假紀錄列表中，若狀態為 APPROVED，顯示「下載假單」按鈕。
- [ ] 3.2 串接 `useLeaveApplicationPdf` 的 `downloadPdf` 方法，在點擊下載時，將該筆請假資料與審核老師資訊合併，產生最終版 PDF。

## 4. 測試與驗證

- [ ] 4.1 在本地環境測試填寫假單，確認所有欄位資料能正確存入與取出。
- [ ] 4.2 以老師角色登入進行審核，再以學生角色登入下載 PDF。
- [ ] 4.3 檢查下載的 PDF 欄位是否正確對齊，老師簽名資訊是否正確呈現。
