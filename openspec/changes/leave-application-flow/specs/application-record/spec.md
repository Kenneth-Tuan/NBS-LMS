## ADDED Requirements

### Requirement: Download Leave Application PDF
The application record interface SHALL provide a way for students to download the generated PDF for approved leave applications.

#### Scenario: Student views an approved leave application
- **WHEN** a student navigates to their application records and finds an approved leave application
- **THEN** a "Download PDF" button or link is visible and functional for that record.

### Requirement: Restrict PDF Download by Status
The system MUST ONLY allow downloading the finalized PDF if the leave application has been approved.

#### Scenario: Student views a pending leave application
- **WHEN** a student views a leave application that is still pending
- **THEN** the option to download the final approved PDF is not available.
