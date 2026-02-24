PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS acquisition_queue;
DROP TABLE IF EXISTS internal_data_blueprint;
DROP TABLE IF EXISTS sources;

CREATE TABLE sources (
  source_id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  focus_area TEXT NOT NULL,
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  url TEXT NOT NULL,
  access_type TEXT NOT NULL,
  data_type TEXT NOT NULL,
  license_notes TEXT,
  recommended_use TEXT NOT NULL,
  priority INTEGER NOT NULL CHECK(priority BETWEEN 1 AND 3),
  last_verified TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE internal_data_blueprint (
  data_id TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  description TEXT NOT NULL,
  example_fields TEXT NOT NULL,
  pii_level TEXT NOT NULL,
  collection_stage TEXT NOT NULL,
  required_for_mvp INTEGER NOT NULL CHECK(required_for_mvp IN (0,1)),
  notes TEXT
);

CREATE TABLE acquisition_queue (
  queue_id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT NOT NULL,
  next_action TEXT NOT NULL,
  owner TEXT NOT NULL DEFAULT 'product+data',
  status TEXT NOT NULL,
  target_phase TEXT NOT NULL,
  risk TEXT,
  priority INTEGER NOT NULL CHECK(priority BETWEEN 1 AND 3),
  FOREIGN KEY (source_id) REFERENCES sources(source_id)
);

INSERT INTO sources VALUES
('ST-CCSS-HOME','standards_framework','general_education','Common Core State Standards','CCSSI','https://corestandards.org/','public','standards_docs','Public educational standards. Check site terms for attribution guidance.','Align ELA and math lesson outputs to grade level standards.',1,'2026-02-22','Foundation alignment source for general education workflows.'),
('ST-CCSS-TERMS','standards_framework','general_education','Common Core Terms Of Use','CCSSI','https://corestandards.org/terms-of-use/','public','license_terms','Use terms published by CCSSI.','Capture attribution and reuse limits in export metadata.',2,'2026-02-22','Legal terms reference for standards usage.'),
('ST-NGSS-STANDARDS','standards_framework','general_education','Next Generation Science Standards','NGSS Lead States','https://www.nextgenscience.org/standards','public','standards_docs','Standards content available publicly with site terms.','Tag science lesson artifacts with NGSS dimensions and performance expectations.',1,'2026-02-22','Core science alignment source for grades 6 to 12.'),
('ST-WIDA-ELD','standards_framework','esl_ell','WIDA English Language Development Standards','WIDA Consortium','https://wida.wisc.edu/teach/standards/eld','licensed','framework_docs','WIDA materials can require license or member access depending on use.','Drive ESL scaffolding, language objective generation, and proficiency-aware outputs.',1,'2026-02-22','Critical for ESL credibility and district acceptance.'),
('ST-CEDS','standards_framework','district_data','Common Education Data Standards','US Department of Education','https://ceds.ed.gov/','public','data_standard','Open federal interoperability standard resources.','Map internal data model fields to district-compatible standard elements.',2,'2026-02-22','Useful for long-term district interoperability.'),
('ST-EDFI-STANDARD','standards_framework','district_data','Ed-Fi Data Standard Overview','Ed-Fi Alliance','https://www.ed-fi.org/ed-fi-data-standard/','public','data_standard','Open standard with implementation docs.','Normalize roster, enrollment, attendance, and assessment entities.',1,'2026-02-22','Important for SIS and state reporting compatibility.'),
('ST-EDFI-REFERENCE','standards_framework','district_data','Ed-Fi Data Standards Reference','Ed-Fi Alliance','https://docs.ed-fi.org/reference/data-exchange/data-standards/','public','reference_docs','Reference docs and versioned schemas.','Use exact field definitions when designing ingestion and validation.',1,'2026-02-22','Use with version pinning to avoid schema drift.'),
('ST-ONEROSTER','standards_framework','district_data','1EdTech OneRoster Standard','1EdTech','https://www.1edtech.org/standards/oneroster','public','interop_standard','Standard specification access with membership options for deeper resources.','Support district roster sync and class structure import.',1,'2026-02-22','High priority for district launch integrations.'),
('ST-LTI','standards_framework','integration','1EdTech LTI Standard','1EdTech','https://www.1edtech.org/standards/lti','public','interop_standard','LTI standard resources for tool interoperability.','Support LMS launch and assignment workflow integration.',2,'2026-02-22','Needed for Canvas and Schoology integration paths.'),
('ST-1EDTECH-SPECS','standards_framework','integration','1EdTech Open Specifications','1EdTech','https://standards.1edtech.org/','public','spec_portal','Specification portal for official standards artifacts.','Reference authoritative technical standards during API design.',2,'2026-02-22','Cross-check all 1EdTech implementation claims.'),

('CP-FERPA-GUIDANCE','compliance_policy','compliance','Student Privacy Guidance Portal','US Department of Education','https://studentprivacy.ed.gov/guidance','public','policy_guidance','Federal guidance portal for FERPA and student privacy practices.','Build district-facing privacy playbooks and admin documentation.',1,'2026-02-22','Primary federal guidance source for student privacy workflows.'),
('CP-FERPA-CFR','compliance_policy','compliance','FERPA Regulation Text 34 CFR Part 99','Cornell LII mirror of eCFR','https://www.law.cornell.edu/cfr/text/34/part-99','public','regulatory_text','Mirror of US regulation text. Validate against official federal publication for legal filings.','Implement deterministic FERPA compliance checks and policy mapping.',1,'2026-02-22','Use legal counsel review for production policy language.'),
('CP-COPPA-FTC-2025','compliance_policy','compliance','FTC COPPA Rule Update 2025','Federal Trade Commission','https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data','public','regulatory_update','FTC announcement of COPPA updates.','Update under-13 consent and data handling controls.',1,'2026-02-22','Important for grades where students are under 13.'),
('CP-COPPA-CFR','compliance_policy','compliance','COPPA Regulation Text 16 CFR Part 312','Cornell LII mirror of eCFR','https://www.law.cornell.edu/cfr/text/16/part-312','public','regulatory_text','Mirror of US regulation text. Validate against official federal publication for legal filings.','Define consent, retention, and notice requirements in product policy engine.',1,'2026-02-22','Requires legal review before final district contracts.'),
('CP-IDEA-HOME','compliance_policy','special_education','IDEA Home','US Department of Education OSEP','https://sites.ed.gov/idea/','public','program_portal','Federal source for IDEA information and updates.','Anchor SPED workflows and documentation references.',1,'2026-02-22','Primary federal source for SPED alignment.'),
('CP-IDEA-STATUTE','compliance_policy','special_education','IDEA Statute And Regulations','US Department of Education OSEP','https://sites.ed.gov/idea/statuteregulations/','public','regulatory_text','Statute and regulation resource pages.','Build deterministic pre-export checks for IEP related drafts.',1,'2026-02-22','Use for legal citation mapping in compliance engine.'),
('CP-IDEA-CFR','compliance_policy','special_education','IDEA Regulation Text 34 CFR Part 300','Cornell LII mirror of eCFR','https://www.law.cornell.edu/cfr/text/34/part-300','public','regulatory_text','Mirror of US regulation text. Validate against official federal publication for legal filings.','Extract machine-readable rule checks for SPED draft validation.',1,'2026-02-22','Do not automate final legal decisions without educator approval.'),
('CP-SECTION504-PROTECT','compliance_policy','special_education','Protecting Students With Disabilities','US Department of Education OCR','https://www.ed.gov/laws-and-policy/civil-rights-laws/protecting-students-disabilities','public','policy_guidance','OCR guidance for disability protections in schools.','Scope 504-related support artifacts and parent communication guidance.',2,'2026-02-22','Pair with district legal interpretation for operational rules.'),
('CP-OCR-DISABILITY-LAWS','compliance_policy','special_education','Disability Discrimination Overview Of Laws','US Department of Education OCR','https://www.ed.gov/laws-and-policy/civil-rights-laws/disability-discrimination/disability-discrimination-overview-of-laws','public','policy_guidance','Overview of disability civil rights laws in education contexts.','Cross-reference legal obligations in admin compliance dashboards.',2,'2026-02-22','Reference only; enforce with district legal policy maps.'),
('CP-DOE-AI-2025','compliance_policy','district_policy','US DOE AI Guidance Announcement July 2025','US Department of Education','https://www.ed.gov/about/news/press-release/us-department-of-education-issues-guidance-artificial-intelligence-use-schools-proposes-additional-supplemental-priority','public','policy_update','Federal AI in schools policy direction and priority signals.','Support DOE and district procurement narratives for responsible AI.',2,'2026-02-22','Use as policy context for district communications.'),

('IN-GCLASSROOM','integration_api','integration','Google Classroom API','Google','https://developers.google.com/workspace/classroom','public','api_docs','API usage governed by Google terms and Workspace policies.','Sync classes, coursework metadata, and assignment context.',1,'2026-02-22','Priority integration for teacher adoption.'),
('IN-GDOCSAPI','integration_api','integration','Google Docs API','Google','https://developers.google.com/docs/api','public','api_docs','API usage governed by Google terms.','Export structured outputs to editable Docs format.',1,'2026-02-22','Core for teacher preferred deliverables.'),
('IN-GSLIDESAPI','integration_api','integration','Google Slides API Overview','Google','https://developers.google.com/workspace/slides/api/guides/overview','public','api_docs','API usage governed by Google terms.','Generate and update slide decks programmatically.',1,'2026-02-22','Needed for one-shot lesson deck generation.'),
('IN-GDRIVEAPI','integration_api','integration','Google Drive API','Google','https://developers.google.com/drive/api','public','api_docs','API usage governed by Google terms and OAuth scopes.','Store and share generated artifacts with teacher ownership.',1,'2026-02-22','Use scoped permissions and tenant boundaries.'),
('IN-CANVAS-API','integration_api','integration','Canvas LMS API Documentation','Instructure','https://canvas.instructure.com/doc/api/','public','api_docs','Canvas API and platform terms apply.','Read course context and publish approved artifacts.',2,'2026-02-22','Plan phased rollout after Google ecosystem basics.'),
('IN-SCHOOLOGY-API','integration_api','integration','Schoology API Documentation','PowerSchool Schoology','https://developers.schoology.com/api/','public','api_docs','Schoology developer terms apply.','Enable district workflows where Schoology is primary LMS.',2,'2026-02-22','Verify tenant-specific API permissions in pilots.'),
('IN-CLEVER-START','integration_api','integration','Clever API Getting Started','Clever','https://dev.clever.com/docs/getting-started','public','api_docs','Clever developer terms and district permissions apply.','Integrate SSO and roster sync in district pilots.',1,'2026-02-22','High value for K-12 onboarding.'),
('IN-CLEVER-USERINFO','integration_api','integration','Clever Userinfo Endpoint','Clever','https://dev.clever.com/docs/the-userinfo-endpoint','public','api_docs','Clever OAuth and permission scopes apply.','Map authenticated educator identity to workspace tenancy.',1,'2026-02-22','Use principle of least privilege for claims.'),
('IN-EDLINK-API','integration_api','integration','Edlink API Documentation','Edlink','https://ed.link/docs/api','public','api_docs','Edlink terms apply for API usage.','Use unified API abstraction across SIS and LMS providers.',2,'2026-02-22','Can reduce integration engineering effort.'),
('IN-EDLINK-SANDBOX','integration_api','integration','Edlink Sandbox Access','Edlink','https://ed.link/docs/start/build/getting-sandbox-access','public','sandbox_docs','Sandbox access process documented by provider.','Set up safe integration testing before district production access.',2,'2026-02-22','Useful for pre-pilot end-to-end testing.'),
('IN-MS-GRAPH-EDU','integration_api','integration','Microsoft Graph Education Overview','Microsoft','https://learn.microsoft.com/en-us/graph/api/resources/education-overview?view=graph-rest-1.0','public','api_docs','Microsoft Graph and tenant permissions apply.','Support districts using Microsoft ecosystems and Teams.',3,'2026-02-22','Phase after core Google and LMS priorities.'),
('IN-CLASSLINK-ROSTER','integration_api','integration','ClassLink Roster Server','ClassLink','https://www.classlink.com/products/roster-server','public','product_docs','ClassLink partnership and district permissions may be required.','Plan ClassLink roster ingestion options for district pilots.',2,'2026-02-22','Confirm API and licensing path with ClassLink partner team.'),
('IN-CLASSLINK-APISANDBOX','integration_api','integration','ClassLink API Sandbox','ClassLink','https://apisandbox.classlink.com/','partner','sandbox_portal','Access may require approved developer credentials.','Validate ClassLink integration flows in non-production environment.',3,'2026-02-22','Potentially gated; start partner conversation early.'),

('DS-NCES-CCD','public_dataset','district_intelligence','NCES Common Core Of Data Files','National Center for Education Statistics','https://nces.ed.gov/ccd/files.asp','public','dataset_portal','Federal education data publication terms apply.','Benchmark district and school context for pilot targeting.',1,'2026-02-22','Useful for go-to-market segmentation and analytics.'),
('DS-EDFACTS-SPECS-2526','public_dataset','district_intelligence','EDFacts File Specifications SY 2025-26','US Department of Education','https://www.ed.gov/data/edfacts-initiative/edfacts-resources/edfacts-file-specifications/edfacts-file-specifications-sy-2025-26','public','spec_docs','Federal publication terms apply.','Align derived metrics and state reporting compatibility.',1,'2026-02-22','High relevance for DOE oriented deployments.'),
('DS-CRDC','public_dataset','equity_reporting','Civil Rights Data Collection','US Department of Education OCR','https://www.ed.gov/laws-and-policy/civil-rights-laws/civil-rights-data-collection-crdc','public','dataset_portal','Federal publication terms apply.','Support equity and compliance analytics in district dashboards.',2,'2026-02-22','Do not mix aggregate CRDC with student level confidential data.'),
('DS-IDEA-618','public_dataset','special_education','IDEA Section 618 Data Products','US Department of Education OSEP','https://www.ed.gov/idea-section-618-data-products','public','dataset_portal','Federal publication terms apply.','Benchmark special education trends and planning contexts.',2,'2026-02-22','Useful for SPED product planning and external reporting context.'),
('DS-NCES-ELSI','public_dataset','district_intelligence','NCES Education Demographic And Geographic Estimates','National Center for Education Statistics','https://nces.ed.gov/programs/edge/','public','dataset_portal','Federal publication terms apply.','Use demographic and boundary context for district prioritization.',3,'2026-02-22','Helpful for market planning, not core runtime logic.'),

('CT-OER-SEARCH','content_library','instructional_content','OER Commons Search Guide','OER Commons','https://help.oercommons.org/support/solutions/articles/42000046863-search-for-content','public','help_docs','Content licensing varies by item. Check each resource license.','Source open instructional texts and media for retrieval context.',2,'2026-02-22','Build per-item license filter in ingestion pipeline.'),
('CT-OER-IMPORT-GDOCS','content_library','instructional_content','OER Commons Import From Google Docs','OER Commons','https://help.oercommons.org/support/solutions/articles/42000046851-import-from-google-docs','public','help_docs','Provider workflow docs; content rights depend on uploaded material.','Understand authoring and import practices used by teachers.',3,'2026-02-22','Useful for interoperability and teacher publishing flows.'),
('CT-OER-SUBMIT','content_library','instructional_content','OER Commons Submit OER Guide','OER Commons','https://help.oercommons.org/support/solutions/articles/42000046849-submit-oer','public','help_docs','Submission terms apply by platform policy.','Design future teacher template sharing with proper rights handling.',3,'2026-02-22','Reference for ecosystem and community workflows.'),
('CT-OPENSTAX-LICENSE','content_library','instructional_content','OpenStax License','OpenStax Rice University','https://openstax.org/license','public','license_terms','OpenStax content available under Creative Commons terms listed on site.','Use legally compliant open content snippets for lesson support.',2,'2026-02-22','Respect attribution and adaptation requirements.'),
('CT-CK12-LICENSE','content_library','instructional_content','CK-12 Curriculum Materials License','CK-12 Foundation','https://www.ck12info.org/curriculum-materials-license/','public','license_terms','CK-12 license sets conditions for curriculum materials usage.','Define allowable retrieval and transformation boundaries.',2,'2026-02-22','Verify AI training and caching permissions before scale usage.'),

('PR-SDPC-NDPA','procurement_privacy','district_procurement','Student Data Privacy Consortium National DPA','Access For Learning Community','https://privacy.a4l.org/national-dpa/','public','contract_template','Template agreement use may require district legal adaptation.','Accelerate district procurement and legal review cycles.',1,'2026-02-22','High leverage for enterprise sales process.'),
('PR-RAND-AI-SCHOOLS','research_evidence','district_policy','RAND AI Use In Schools Report','RAND Corporation','https://www.rand.org/content/dam/rand/pubs/research_reports/RRA100/RRA134-25/RAND_RRA134-25.pdf','public','research_report','RAND publication terms apply.','Ground product strategy in teacher and principal adoption realities.',2,'2026-02-22','Use for external-facing evidence and investor narratives.');

INSERT INTO internal_data_blueprint VALUES
('ID-TEACHER-PROFILE','workspace_context','Teacher account and preferences for personalization.','teacher_id, grade_bands, subjects, preferred_languages, output_defaults','medium','onboarding',1,'Core to one-shot quality and medium selection.'),
('ID-CLASS-PROFILE','workspace_context','Class level settings and routine template context.','class_id, roster_ref, routine_blocks, period_length, support_flags','high','onboarding',1,'Needed to generate realistic daily artifacts.'),
('ID-REQUEST-EVENT','agent_runtime','Prompt plus attachment metadata and intent labels.','request_id, teacher_id, prompt_text, attachment_ids, inferred_intent','high','runtime',1,'Primary training signal for orchestration quality.'),
('ID-ATTACHMENT-META','agent_runtime','Document and image extraction metadata without raw student text logs.','attachment_id, file_type, parse_success, extracted_topics, confidence','high','runtime',1,'Store metadata and references; avoid unnecessary raw retention.'),
('ID-PLAN-GRAPH','agent_runtime','Agent decomposition and task execution graph.','request_id, task_nodes, dependency_edges, execution_times','low','runtime',1,'Critical for debugging and improving one-shot planner.'),
('ID-ARTIFACT-OUTPUT','artifact_management','Generated artifacts and versions by medium.','artifact_id, request_id, medium_type, language, tier, version','medium','runtime',1,'Core output inventory and delivery record.'),
('ID-EDIT-EVENT','quality_feedback','Teacher edits to generated artifacts.','edit_id, artifact_id, edit_type, before_after_diff, timestamp','medium','post_generation',1,'Most valuable supervision signal for model and template tuning.'),
('ID-APPROVAL-EVENT','safety_compliance','Teacher approval gates for high-risk outputs.','approval_id, artifact_id, risk_level, approved_by, approved_at','medium','pre_delivery',1,'Mandatory for grades and SPED final exports.'),
('ID-EXPORT-EVENT','delivery_analytics','Final delivery medium and destination event.','export_id, artifact_id, medium, destination, success_flag','low','delivery',1,'Tracks workflow completion and medium preference.'),
('ID-OUTCOME-FEEDBACK','impact_metrics','Teacher quality rating and time-saved self report.','feedback_id, request_id, usefulness_score, minutes_saved, comments','low','post_delivery',1,'Supports KPI tracking and iterative product improvements.'),
('ID-DISTRICT-POLICY','compliance_config','District and DOE policy toggles and retention settings.','district_id, retention_days, allowed_models, redaction_rules','high','admin_setup',1,'Enables district specific governance controls.'),
('ID-LANGUAGE-PROFILE','esl_support','Language distribution and support requirements by class.','class_id, home_languages, translation_defaults, scaffolding_level','medium','onboarding',1,'Drives multilingual and ESL support at generation time.');

INSERT INTO acquisition_queue (source_id,next_action,status,target_phase,risk,priority) VALUES
('ST-WIDA-ELD','Confirm license scope for product usage and caching.','todo','phase_1','Licensing uncertainty can block ESL feature depth.',1),
('IN-CLEVER-START','Request sandbox credentials and define pilot district onboarding flow.','todo','phase_1','Access approval timelines may delay integration tests.',1),
('IN-GCLASSROOM','Implement read-only pilot integration with scoped OAuth permissions.','todo','phase_1','Scope creep if writeback added too early.',1),
('IN-CANVAS-API','Design phase 2 adapter behind integration interface.','todo','phase_2','Different district configurations increase support load.',2),
('PR-SDPC-NDPA','Prepare legal checklist aligned with NDPA for pilot contracting.','todo','phase_1','Procurement delay without legal readiness.',1),
('DS-EDFACTS-SPECS-2526','Create derived district metrics dictionary tied to file specs.','todo','phase_1','Metric inconsistency across states if not normalized.',2),
('CT-OPENSTAX-LICENSE','Document allowed and disallowed uses in content ingestion policy.','todo','phase_1','License breach risk if terms are not encoded.',1),
('CP-DOE-AI-2025','Map DOE guidance themes to product trust and safety controls.','todo','phase_1','Weak policy narrative can hurt district buy-in.',2);
