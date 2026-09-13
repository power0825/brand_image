# AGENTS.md — Brand Visual Workflow Demo

## 1. Purpose

This project is a **classroom demo workflow**, not a full autonomous agent system.

The goal is simple:

> Start from an existing **Brand Core**, then complete four guided steps to generate a usable brand visual system.

The workflow is:

```text
Brand Core
   ↓
01 Visual Brief
   ↓
02 3 Visual Directions
   ↓
User chooses one direction
   ↓
03 Logo + Visual DNA
   ↓
User confirms
   ↓
04 Brand Visual Rules
```

Keep the experience fast, visual, and easy to demonstrate in class.

Do not over-engineer.

---

# 2. Core Product Structure

Use a simple 4-step wizard / stepper.

```text
Step 1
Brand Core → Visual Brief

Step 2
Visual Brief → 3 Visual Directions

Step 3
Selected Direction → Logo + Visual DNA

Step 4
Logo + Visual DNA → Brand Visual Rules
```

Each step should:

1. Read the output from the previous step
2. Generate the next deliverable
3. Show the result clearly
4. Let the user make a small correction
5. Save the approved result
6. Continue to the next step

---

# 3. Minimal Data Structure

Use one simple project object.

```json
{
  "brandCore": {},
  "visualBrief": {},
  "visualDirections": [],
  "selectedDirection": null,
  "logoOptions": [],
  "selectedLogo": null,
  "visualDNA": {},
  "visualRules": {}
}
```

For the classroom demo, this can be stored in:

- local state
- localStorage
- one JSON file

A database is not required for the first version.

---

# 4. Step 01 — Brand Core → Visual Brief

## Input

The user pastes or imports the Brand Core.

Recommended fields:

```text
Brand Name
Brand Purpose
Brand Promise
Target Audience
Brand Positioning
Brand Personality
Key Differentiation
Usage Context
Tagline
```

Do not force every field to exist.

## AI Task

Translate brand strategy into visual meaning.

The AI should answer:

- What should this brand feel like?
- What should people perceive?
- What visual characteristics fit the brand?
- What should the brand avoid looking like?

## Output

### Visual Brief

Keep the output concise.

```text
Brand Essence
Desired Perception
Visual Personality
Visual Keywords
Emotional Keywords
Usage Scenarios
Differentiation Cues
Avoid List
```

A useful format is a single editable card.

## Classroom Key Point

> Do not generate images first. Understand the brand first.

---

# 5. Step 02 — Generate 3 Visual Directions

## Input

Use:

```text
Brand Core
+
Approved Visual Brief
```

## AI Task

Generate **3 clearly different visual directions**.

Do not make three small variations of the same style.

Each direction should include:

```text
Direction Name
Core Idea
Mood
Color
Typography
Composition
Lighting
Photography / Illustration
Material
Graphic Style
Avoid
```

## Visual Output

For each direction, generate:

- 1 hero / representative visual

Optional for a stronger demo:

- 1 lifestyle visual

So the screen shows three visual worlds side by side.

Example:

```text
A. Quiet Domesticity
B. Intelligent Night
C. Soft Modern Living
```

## User Action

The user chooses one direction.

Optional actions:

- regenerate one direction
- slightly modify one direction
- combine one specific element from another direction

Do not build complex version control.

## Output

```text
Selected Visual Direction
```

## Classroom Key Point

> AI generates possibilities. Humans make choices.

---

# 6. Step 03 — Generate Logo + Visual DNA

## Input

Use:

```text
Brand Core
+
Visual Brief
+
Selected Visual Direction
```

## Part A — Logo

Generate **3 logo concepts**.

Each concept should have:

```text
Logo Image
Concept Name
Short Explanation
Why it fits the brand
```

The user selects one.

Do not attempt trademark validation in this demo.

## Part B — Visual DNA

Generate the brand's core visual system.

Use these 8 dimensions:

```text
1. Color
2. Typography
3. Composition
4. Lighting
5. Photography
6. People
7. Material
8. Graphic Language
```

For each dimension, keep the structure simple:

```text
Principle
DO
DON'T
```

Example:

```text
Lighting

Principle:
Soft practical light, calm and realistic.

DO:
Warm neutral light
Soft shadows
Low-to-medium contrast

DON'T:
Cyberpunk neon
Luxury golden glow
Harsh studio lighting
```

## Output

```text
Selected Logo
+
Visual DNA
```

## Classroom Key Point

> Consistency comes from rules, not from making every image look the same.

---

# 7. Step 04 — Generate Brand Visual Rules

## Input

Use all approved results:

```text
Brand Core
Visual Brief
Selected Visual Direction
Selected Logo
Visual DNA
```

## AI Task

Convert the previous outputs into one simple brand visual guide.

## Output

### Brand Visual Rules

Recommended sections:

```text
01 Brand Visual Summary

02 Logo Rules

03 Color Rules

04 Typography Rules

05 Composition Rules

06 Photography & Lighting Rules

07 People & Material Rules

08 Graphic Language Rules

09 DO / DON'T

10 AI Prompt Recipe
```

## AI Prompt Recipe

Create one reusable structure:

```text
Subject
+ Scenario
+ Environment
+ Composition
+ Lighting
+ Color
+ Material
+ Camera / Rendering
+ Mood
+ Brand Constraints
+ Negative Rules
```

Also generate one reusable instruction block:

```text
"When creating content for this brand, always follow these visual rules..."
```

This can later be reused in image generation, social content, ecommerce visuals, presentations, etc.

## Final Export

For the demo, only support:

- HTML
- Markdown

Optional:

- JSON

PDF and advanced asset packaging can be added later.

---

# 8. Recommended UI

Use one simple page with a top stepper:

```text
01 Visual Brief
02 Visual Directions
03 Logo + Visual DNA
04 Visual Rules
```

Each step should have:

```text
Left:
Input / explanation

Center:
AI result

Bottom or right:
Approve / Revise / Continue
```

For Step 2 and Step 3, use card comparison.

---

# 9. Minimal AI Functions

Do not build multiple autonomous agents.

Use four prompt functions:

```text
generateVisualBrief()

generateVisualDirections()

generateBrandIdentity()

generateVisualRules()
```

Optional fifth function:

```text
generateImage()
```

That is enough for the classroom version.

---

# 10. Suggested Code Structure

Keep the project small.

```text
/src
  /components
    Stepper
    ResultCard
    DirectionCard
    LogoCard

  /steps
    Step1VisualBrief
    Step2VisualDirections
    Step3BrandIdentity
    Step4VisualRules

  /prompts
    visualBrief
    visualDirections
    brandIdentity
    visualRules

  /services
    llm
    imageGeneration

  /store
    projectState
```

Avoid premature complexity.

No agent orchestration framework is required.

No queue system is required.

No vector database is required.

No long-term memory system is required.

No multi-user permission system is required.

---

# 11. Demo Flow in Class

A good live demonstration can be completed in 10–15 minutes.

```text
1. Paste Brand Core
   ↓
2. Generate Visual Brief
   ↓
3. Generate 3 Visual Directions
   ↓
4. Ask the audience to choose one
   ↓
5. Generate 3 Logo Options + Visual DNA
   ↓
6. Choose one Logo
   ↓
7. Generate final Brand Visual Rules
```

The best classroom moment should be Step 2:

> Let the audience choose the visual direction.

This demonstrates the ideal relationship between AI and humans:

```text
AI = Explore
Human = Decide
AI = Execute
Human = Approve
```

---

# 12. MVP Definition of Done

The classroom demo is complete when it can reliably output:

```text
✓ Visual Brief
✓ 3 Visual Directions
✓ 3 Logo Options
✓ Visual DNA
✓ Brand Visual Rules
✓ HTML / Markdown export
```

Nothing more is required for Version 1.

---

# 13. Product Principle

The demo should communicate one idea clearly:

> **AI should not just generate brand images.  
> It should turn Brand Core into a consistent visual system.**

中文：

> **AI 不只是生成几张品牌图片，而是把 Brand Core 转化成一套统一的品牌视觉体系。**
