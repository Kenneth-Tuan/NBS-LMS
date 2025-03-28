class Course {
  constructor({
    id = "", // 課程編號
    name = "", // 課程名稱
    teacherId = "", // 教師ID
    teacherName = "", // 教師姓名
    semester = "", // 學期 (例: 2024-1)
    credits = 0, // 學分數
    category = "", // 課程類別
    tags = [], // 課程標籤
    maxStudents = 0, // 人數上限
    currentStudents = 0, // 目前選課人數
    description = "", // 課程描述
    prerequisites = [], // 先修科目列表
    location = "", // 上課地點
    schedule = [], // 上課時間 [{day: 1, period: 1}, ...]
    thumbnail = "", // 課程縮圖URL
    visible = true, // 是否可見
    status = "draft", // 課程狀態: draft, published, closed
    submitted = false, // 是否已提交
    approved = false, // 是否已審核
  }) {
    // 基本資訊
    this.id = id;
    this.name = name;
    this.teacherId = teacherId;
    this.teacherName = teacherName;
    this.semester = semester;
    this.credits = credits;
    this.category = category;
    this.tags = tags;

    // 人數相關
    this.maxStudents = maxStudents;
    this.currentStudents = currentStudents;

    // 課程內容
    this.description = description;
    this.prerequisites = prerequisites;
    this.thumbnail = thumbnail;

    // 時間地點
    this.location = location;
    this.schedule = schedule;

    // 狀態
    this.visible = visible;
    this.status = status;

    // 時間戳記
    this.createdAt = new Date();
    this.updatedAt = new Date();

    // 審核
    this.submitted = submitted;
    this.approved = approved;
  }

  // Getters
  get isAvailable() {
    return this.currentStudents < this.maxStudents;
  }

  get availableSeats() {
    return this.maxStudents - this.currentStudents;
  }

  // Methods
  addStudent() {
    if (!this.isAvailable) {
      throw new Error("Course is full");
    }
    this.currentStudents += 1;
    this.updatedAt = new Date();
  }

  removeStudent() {
    if (this.currentStudents <= 0) {
      throw new Error("No students to remove");
    }
    this.currentStudents -= 1;
    this.updatedAt = new Date();
  }

  updateStatus(newStatus) {
    const validStatuses = ["draft", "published", "closed"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error("Invalid status");
    }
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  // 檢查時間衝突
  hasTimeConflict(otherSchedule) {
    return this.schedule.some((timeSlot) =>
      otherSchedule.some(
        (otherSlot) =>
          timeSlot.day === otherSlot.day && timeSlot.period === otherSlot.period
      )
    );
  }

  // 轉換為JSON格式
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      teacherId: this.teacherId,
      teacherName: this.teacherName,
      semester: this.semester,
      credits: this.credits,
      category: this.category,
      tags: this.tags,
      maxStudents: this.maxStudents,
      currentStudents: this.currentStudents,
      description: this.description,
      prerequisites: this.prerequisites,
      location: this.location,
      schedule: this.schedule,
      thumbnail: this.thumbnail,
      visible: this.visible,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export default Course;
