## ADDED Requirements

### Requirement: Generate Leave Application PDF
The system SHALL generate a PDF document based on a standardized leave application template when requested.

#### Scenario: User requests PDF generation
- **WHEN** the system is instructed to generate a leave application PDF with application data
- **THEN** it loads the blank PDF template and fills in the student and course details at predefined coordinates.

### Requirement: Overlay Teacher Approval Details
The system MUST include the teacher's approval details (name and date) on the generated PDF if the application is approved.

#### Scenario: Approved application PDF generation
- **WHEN** an approved application is used to generate the PDF
- **THEN** the teacher's name and the approval date are overlaid in the "Teacher Signature" section of the document.
