import type { InferredIntent } from '@teachassist/schemas';

export function generateFixtureContent(intent: InferredIntent, prompt: string): string {
  const generators: Record<string, (prompt: string) => string> = {
    lesson_plan: generateLessonPlan,
    worksheet: generateWorksheet,
    assessment: generateAssessment,
    slide_deck: generateSlideDeck,
    parent_letter: generateParentLetter,
    iep_support: generateIEPSupport,
    translation: generateTranslation,
    seating_chart: generateSeatingChart,
    rubric: generateRubric,
    other: generateGeneric,
  };

  const generator = generators[intent] || generateGeneric;
  return generator(prompt);
}

function generateLessonPlan(prompt: string): string {
  return `# Lesson Plan

## Topic
${extractTopic(prompt)}

## Learning Objectives
- Students will be able to understand and apply key concepts related to the topic
- Students will demonstrate comprehension through guided and independent practice
- Students will engage in collaborative discussion to deepen understanding

## Materials Needed
- Whiteboard and markers
- Student handouts (provided)
- Chromebooks/tablets for interactive activities
- Exit ticket template

## Warm-Up (10 minutes)
Begin with a think-pair-share activity. Display a provocative question on the board related to the topic. Give students 2 minutes to think individually, 2 minutes to discuss with a partner, and then facilitate a brief whole-class share-out.

## Direct Instruction (15 minutes)
Present the core concepts using a combination of visual aids and guided note-taking. Check for understanding at key points using thumbs up/down or mini-whiteboards.

## Guided Practice (10 minutes)
Work through 2-3 example problems as a class. Use cold-calling to ensure all students are engaged. Provide sentence frames for ELL students.

## Independent Practice (10 minutes)
Students work individually on a set of practice problems. Circulate the room to provide targeted support. Offer extension problems for advanced learners and modified problems for approaching-level students.

## Assessment & Closure (5 minutes)
Distribute exit tickets. Students complete 2-3 questions that assess the lesson objectives. Use responses to inform tomorrow's instruction.

## Differentiation Notes
- **Approaching**: Provide graphic organizers and word banks
- **On-Level**: Standard lesson materials
- **Advanced**: Extension problems with higher-order thinking questions
- **ELL/ESL**: Sentence frames, visual supports, bilingual glossary

## Standards Alignment
- Common Core State Standards applicable to grade level and subject
`;
}

function generateWorksheet(prompt: string): string {
  return `# Worksheet: ${extractTopic(prompt)}

## Name: _________________ Date: _________________ Period: _____

### Part 1: Vocabulary (10 points)
Match each term with its correct definition.

1. _________________ — Definition A
2. _________________ — Definition B
3. _________________ — Definition C
4. _________________ — Definition D
5. _________________ — Definition E

### Part 2: Short Answer (20 points)
Answer each question in 2-3 complete sentences.

1. Explain the main concept in your own words.
   _____________________________________________________________
   _____________________________________________________________

2. How does this concept apply to real-world situations?
   _____________________________________________________________
   _____________________________________________________________

3. Compare and contrast the two approaches discussed in class.
   _____________________________________________________________
   _____________________________________________________________

4. What would happen if the key variable changed? Explain your reasoning.
   _____________________________________________________________
   _____________________________________________________________

### Part 3: Application (20 points)
Solve the following problems. Show all work.

1. Problem 1
   Space for work:


2. Problem 2
   Space for work:


### Bonus Challenge
Create your own example that demonstrates understanding of the concept.
`;
}

function generateAssessment(prompt: string): string {
  return `# Assessment: ${extractTopic(prompt)}

## Name: _________________ Date: _________________ Period: _____
## Total Points: 50 | Time: 30 minutes

### Section 1: Multiple Choice (15 points — 3 points each)
Select the best answer for each question.

1. Which of the following best describes the main concept?
   a) Option A
   b) Option B
   c) Option C
   d) Option D

2. What is the primary purpose of this approach?
   a) Option A
   b) Option B
   c) Option C
   d) Option D

3. When analyzing the scenario, which factor is most important?
   a) Option A
   b) Option B
   c) Option C
   d) Option D

4. Which example best illustrates the concept?
   a) Option A
   b) Option B
   c) Option C
   d) Option D

5. What conclusion can be drawn from the evidence presented?
   a) Option A
   b) Option B
   c) Option C
   d) Option D

### Section 2: Short Response (20 points — 5 points each)

6. Describe the key concept and provide one real-world example.

7. Explain how two related ideas connect to each other.

8. Analyze the given scenario and propose a solution.

9. Evaluate the effectiveness of the approach discussed in class.

### Section 3: Extended Response (15 points)

10. Write a well-organized paragraph that demonstrates your understanding of the topic. Include specific details and examples from class materials.

---
*Answer Key available separately for teacher use.*
`;
}

function generateSlideDeck(prompt: string): string {
  return `# Slide Deck: ${extractTopic(prompt)}

## Slide 1 — Title
**${extractTopic(prompt)}**
Grade Level | Subject | Date

## Slide 2 — Learning Objectives
By the end of this lesson, students will be able to:
- Objective 1: Understand key concepts
- Objective 2: Apply knowledge to new situations
- Objective 3: Analyze and evaluate information

## Slide 3 — Warm-Up Question
*Think about this...*
What do you already know about this topic?
Share with your table partner.

## Slide 4 — Key Vocabulary
| Term | Definition |
|------|-----------|
| Term 1 | Definition 1 |
| Term 2 | Definition 2 |
| Term 3 | Definition 3 |

## Slide 5 — Core Concept
Main idea explanation with visual support.
Key takeaway highlighted in bold.

## Slide 6 — Guided Practice
Let's work through this together:
- Step 1
- Step 2
- Step 3

## Slide 7 — Your Turn
Independent practice activity.
Remember to show your work!

## Slide 8 — Wrap-Up
- What did we learn today?
- Exit ticket question
- Tomorrow's preview
`;
}

function generateParentLetter(prompt: string): string {
  return `# Parent/Guardian Communication

Dear Families,

I hope this letter finds you well. I am writing to share some important information about our current unit of study: **${extractTopic(prompt)}**.

## What We're Learning
In class, students are currently exploring key concepts related to this topic. Our learning goals include building understanding, developing critical thinking skills, and applying knowledge to real-world contexts.

## How You Can Help at Home
- Ask your child what they learned in class today
- Encourage reading and discussion about the topic
- Help your child complete homework assignments
- Provide a quiet study space

## Upcoming Dates
- Unit Assessment: [Date TBD]
- Project Due: [Date TBD]
- Parent-Teacher Conference: [Date TBD]

## Contact Information
Please don't hesitate to reach out if you have any questions or concerns about your child's progress.

- Email: [teacher email]
- Office Hours: [days/times]
- Phone: [school phone]

Thank you for your continued support of your child's education.

Warm regards,
[Teacher Name]
[Subject] Teacher
`;
}

function generateIEPSupport(prompt: string): string {
  return `# IEP Accommodation Support: ${extractTopic(prompt)}

> **NOTICE: This document contains information related to special education services and requires teacher review and approval before use. This is a draft support document — not an official IEP.**

## Student Accommodation Strategies

### Presentation Accommodations
- Provide materials in enlarged print
- Use text-to-speech software
- Offer audio recordings of reading passages
- Provide graphic organizers for note-taking
- Use visual aids and manipulatives

### Response Accommodations
- Allow verbal responses
- Provide word banks for written responses
- Permit use of assistive technology
- Offer extended time for written assignments
- Provide sentence starters and frames

### Setting Accommodations
- Preferential seating near instruction
- Reduced-distraction testing environment
- Small group instruction opportunities
- Quiet workspace option
- Flexible seating arrangements

### Timing/Scheduling Accommodations
- Extended time (1.5x standard)
- Frequent breaks during assessments
- Chunked assignments with checkpoints
- Modified homework load as appropriate

### Modified Assessment Strategies
- Reduced number of answer choices
- Shortened assessments covering same objectives
- Portfolio-based assessment options
- Oral examination alternatives

## Data Collection Notes
- Track accommodation usage and effectiveness
- Document student progress toward IEP goals
- Note any modifications needed for future planning

---
*This document is generated as a planning aid. All accommodations must align with the student's current IEP and be approved by the IEP team.*
`;
}

function generateTranslation(prompt: string): string {
  return `# Translation Request: ${extractTopic(prompt)}

## Original Content (English)
The following content has been prepared for translation. Please note that pedagogical intent and formatting should be preserved.

---

${extractTopic(prompt)}

This educational material covers key concepts that students need to understand. The content includes vocabulary, practice activities, and assessment components.

## Key Terms for Translation
- Learning objective → [translation needed]
- Assessment → [translation needed]
- Practice → [translation needed]
- Vocabulary → [translation needed]

## Notes for Translator
- Maintain grade-appropriate language level
- Preserve formatting and structure
- Keep proper nouns unchanged
- Adapt cultural references as appropriate
- Ensure mathematical notation remains standard

---
*Translation support generated. Connect with a qualified translator or use AI translation service for target language conversion.*
`;
}

function generateSeatingChart(prompt: string): string {
  return `# Seating Chart: ${extractTopic(prompt)}

## Classroom Layout

\`\`\`
    [  BOARD / SCREEN  ]

  [1]  [2]  [3]  [4]  [5]
  [6]  [7]  [8]  [9]  [10]
  [11] [12] [13] [14] [15]
  [16] [17] [18] [19] [20]
  [21] [22] [23] [24] [25]

    [  TEACHER DESK  ]
\`\`\`

## Seating Assignments
| Seat | Student Name | Notes |
|------|-------------|-------|
| 1 | [Assign] | |
| 2 | [Assign] | |
| 3 | [Assign] | |
| ... | ... | ... |

## Grouping Considerations
- **Proximity to instruction**: Seats 1-5 for students needing closer proximity
- **Collaborative pairs**: Even/odd seat pairings for partner work
- **Small groups**: Rows form natural table groups
- **Support access**: Edge seats allow easy teacher circulation

## Accommodation Notes
- Students with IEP seating requirements placed per their plans
- ELL students paired with bilingual peers when possible
- Visual/hearing accommodations in front rows
`;
}

function generateRubric(prompt: string): string {
  return `# Rubric: ${extractTopic(prompt)}

## Assignment Overview
This rubric assesses student work related to the topic.

| Criteria | Exemplary (4) | Proficient (3) | Developing (2) | Beginning (1) |
|----------|--------------|----------------|-----------------|----------------|
| **Content Knowledge** | Demonstrates thorough understanding with detailed examples | Shows solid understanding with adequate examples | Shows partial understanding with limited examples | Shows minimal understanding |
| **Critical Thinking** | Insightful analysis with original connections | Clear analysis with relevant connections | Basic analysis with some connections | Limited analysis |
| **Communication** | Exceptionally clear and well-organized | Clear and organized | Somewhat clear with some organization | Unclear or disorganized |
| **Evidence & Support** | Multiple strong, relevant pieces of evidence | Adequate relevant evidence | Some evidence, not always relevant | Little or no evidence |
| **Conventions** | Error-free writing | Minor errors that don't impede understanding | Some errors that occasionally impede understanding | Frequent errors that impede understanding |

## Scoring Guide
- **A (18-20 points)**: Exemplary work demonstrating mastery
- **B (14-17 points)**: Proficient work meeting all objectives
- **C (10-13 points)**: Developing work meeting most objectives
- **D/F (Below 10)**: Beginning work requiring additional support

## Total Score: _____ / 20

### Teacher Comments:
_________________________________________________________________
_________________________________________________________________
`;
}

function generateGeneric(prompt: string): string {
  return `# Teaching Material: ${extractTopic(prompt)}

## Overview
This material addresses the following teaching need: ${prompt}

## Content

### Section 1: Introduction
An introduction to the topic providing context and relevance for students.

### Section 2: Key Concepts
- Concept 1: Description and explanation
- Concept 2: Description and explanation
- Concept 3: Description and explanation

### Section 3: Practice Activities
Activities designed to reinforce student understanding and provide opportunities for application.

### Section 4: Assessment
Methods for checking student understanding and measuring learning outcomes.

## Teacher Notes
- Adapt content as needed for your specific classroom context
- Consider differentiation needs for diverse learners
- Align with relevant standards for your grade level and subject
`;
}

function extractTopic(prompt: string): string {
  const cleaned = prompt.trim();
  if (cleaned.length <= 80) return cleaned;
  return cleaned.substring(0, 80) + '...';
}
