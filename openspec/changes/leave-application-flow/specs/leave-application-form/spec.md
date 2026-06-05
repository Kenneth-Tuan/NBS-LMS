## ADDED Requirements

### Requirement: Additional Leave Form Fields
The leave application form SHALL collect additional information required for the standardized PDF, such as the total number of periods (節數) requested.

#### Scenario: Student fills out leave application
- **WHEN** a student opens the leave application form
- **THEN** they see an input field for "Total Periods" alongside dates, reason, and course selection.

### Requirement: Submit Leave Application with Full Details
The system MUST submit the complete application data, including the newly added fields, to the backend API.

#### Scenario: Submitting the enhanced form
- **WHEN** a student successfully submits the leave application form
- **THEN** the request payload includes all fields needed for the final PDF generation.
