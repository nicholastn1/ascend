# MDI Template — Complete Formatting Specification

Extracted from `CV_NicholasNogueira_SR_SWE (Engine).docx`. Every measurement is exact.

---

## 1. Page Setup

| Property       | Value                          |
|----------------|--------------------------------|
| Page size      | US Letter (8.5 × 11 in / 612 × 792 pt) |
| Top margin     | 30 pt (0.417 in)               |
| Bottom margin  | 14 pt (0.194 in)               |
| Left margin    | 49 pt (0.681 in)               |
| Right margin   | 48 pt (0.667 in)               |
| Header distance| 0.5 in                         |
| Footer distance| 0.5 in                         |

---

## 2. Global Defaults

| Property      | Value                    |
|---------------|--------------------------|
| Font family   | **Arial** (sans-serif)   |
| Default size  | 12 pt (body text)        |
| Text color    | Black (#000000)          |
| Link color    | Blue (#1155CC)           |
| Icons         | None — all icons hidden  |
| Primary color | Not used (pure B&W)      |

---

## 3. Section Order

1. Header (name, headline, contact, profiles) — **first page only**
2. SUMMARY
3. SKILLS
4. WORK EXPERIENCE
5. EDUCATION
6. LANGUAGES

Profiles are rendered **inline in the header**, not as a standalone section.

---

## 4. Header

Rendered only on page 1. Centered alignment for all elements.

### 4.1 Name
- Font: **Arial 20 pt, bold**
- Alignment: **center**
- Text: **UPPERCASE** (as typed by user, stored uppercase)
- Space after: **6 pt**

### 4.2 Headline
- Font: **Arial 16 pt, bold**
- Alignment: **center**
- Space after: **6 pt**

### 4.3 Contact Line
- Font: **Arial 12 pt** (inherits from body default)
- Alignment: **center**
- Line height: **1.5**
- Format: `Location: {value} | Phone: {value} | E-mail: {value}`
- Labels ("Location:", "Phone", "E-mail") are **bold**
- Values are **normal weight**
- Separator: ` | ` (space, pipe, space)
- Phone and email values are **hyperlinks** (blue #1155CC)

### 4.4 Profiles Line
- Same line as contact or on a separate centered line
- Font: **Arial 12 pt**
- Line height: **1.5**
- Format: `LinkedIn: {url} | Github: {url}`
- Labels ("LinkedIn", "Github") are **bold**
- URLs are **hyperlinks** (blue #1155CC, underlined)
- Separator: ` | `

---

## 5. SUMMARY Section

### 5.1 Section Heading
- Text: `SUMMARY`
- Font: **Arial 12.5 pt, bold, underlined**
- Case: **ALL CAPS**
- Alignment: **left**
- Space before: **10 pt**
- Space after: **10 pt**

### 5.2 Bullet Items
- Bullet character: `•` (Roboto 10.5 pt for the bullet, then Arial 12 pt for text)
- Alignment: **justified**
- Line height: **1.0417** (~1.04)
- Space before: **0** (no extra spacing between bullets)
- Space after: **0**
- No left indent (bullets are flush with text margin)
- Each bullet point is a separate paragraph

---

## 6. SKILLS Section

### 6.1 Section Heading
- Text: `SKILLS`
- Font: **Arial 12.5 pt, bold, underlined**
- Case: **ALL CAPS**
- Alignment: **left**
- Space before: **10 pt**
- Space after: **10 pt**

### 6.2 Proficiency Groups
Skills are **grouped by proficiency level**, not listed individually.

Each group is a single paragraph:
- Font: **Arial 12 pt**
- Alignment: **justified**
- Line height: **1.0583** (~1.06)
- Space before: **4.4 pt** (between groups)
- Format: `{Proficiency}: {Skill1} ({keywords}), {Skill2}, {Skill3} ({keywords}).`
- Proficiency label ("Proficient:", "Intermediate:", "Beginner:") is **bold**
- Skill names and keywords are **normal weight**
- Keywords follow their skill name in parentheses: `Web APIs (REST/GraphQL)`
- Skills within a group separated by `, ` (comma + space)
- Each group ends with `.` (period)

---

## 7. WORK EXPERIENCE Section

### 7.1 Section Heading
- Text: `WORK EXPERIENCE`
- Font: **Arial 12.5 pt, bold, underlined**
- Case: **ALL CAPS**
- Alignment: **justified**
- Space before: **10 pt**
- Space after: **5 pt**

### 7.2 Company Block (repeats per company)

#### Line 1 — Company Name + Location
- Font: **Arial 12.5 pt**
- Alignment: **left** (inherit)
- Space before: **10 pt** (except first company which has 0, since section heading already has 5pt after)
- Format: `**COMPANY** (City, State, Country - *WorkMode*)`
- Company name: **bold, UPPERCASE** (as stored)
- Location + work mode: **normal weight**
- Work mode (Hybrid/Remote): **italic**
- No space after

#### Line 2 — Company Description
- Font: **Arial 12.5 pt, italic**
- Alignment: **justified**
- Line height: **0.9708** (~0.97, tighter than body)
- Space before: **3.7 pt** (only if description exists; otherwise this line is omitted)
- This is a short italic description of what the company does
- Note: first company has description directly after company line; subsequent companies have 3.7pt before

#### Line 3 — Position/Role + Period
- Font: **Arial 12.5 pt**
- Alignment: **left** (inherit)
- Space before: **3.7 pt** (if company description exists) or **0** (if no description)
- Line height: **0.9708**
- Format: `***Position | Role*** *(Period)*`
- Position + Role: **bold + italic**
- Period: **italic only** (not bold), in parentheses
- Example: `***Software Engineer | Full Stack*** *(05/2024 – Present)*`

#### Bullet Points — Achievements
- Bullet character: `•` (Roboto 10.5 pt, then Arial 12 pt for text)
- Alignment: **justified**
- Line height: **1.0417**
- Space before/after: **0** between bullets
- No left indent
- Each bullet is a separate paragraph

### 7.3 Multiple Companies
- Each new company block has **10 pt space before** the company name line
- The pattern repeats: Company Name → Company Description → Position → Bullets

---

## 8. EDUCATION Section

### 8.1 Section Heading
- Text: `EDUCATION`
- Font: **Arial 12.5 pt, bold, underlined**
- Case: **ALL CAPS**
- Alignment: **left** (inherit)
- Space before: **10 pt**
- Space after: **5 pt**

### 8.2 Items
Education uses a bullet-style list (not the two-column company/location layout).

#### Line 1 — Degree
- Bullet: `•` (Roboto 10.5 pt)
- Font: **Arial 12.5 pt, bold**
- Alignment: **left**
- Format: `• **Bachelor degree in Computer Science**`

#### Line 2 — Institution (indented)
- Tab indent before bullet
- Bullet: `•` (Roboto 10.5 pt)
- Font: **Arial 12.5 pt, normal**
- Format: `	• University Center Farias Brito (Brazil)`
- Note: indented with a tab character, followed by bullet

---

## 9. LANGUAGES Section

### 9.1 Section Heading
- Text: `LANGUAGES`
- Font: **Arial 12.5 pt, bold, underlined**
- Case: **ALL CAPS**
- Alignment: **left** (inherit)
- Space before: **10 pt**
- Space after: **5 pt**

### 9.2 Items
Each language is a bullet-style line:
- Bullet: `•` (Roboto 10.5 pt)
- Font: **Arial 12 pt**
- Line height: **1.0417**
- Format: `• **Language**: details`
- Language name: **bold**
- Details (fluency, level): **normal weight**
- Separator between details: ` | `
- Example: `• **English**: advanced | fluent | C1`

---

## 10. Summary of Font Sizes

| Element                     | Font    | Size    | Weight      | Style   | Decoration |
|-----------------------------|---------|---------|-------------|---------|------------|
| Name                        | Arial   | 20 pt   | Bold        | Normal  | None       |
| Headline                    | Arial   | 16 pt   | Bold        | Normal  | None       |
| Contact labels              | Arial   | 12 pt   | Bold        | Normal  | None       |
| Contact values              | Arial   | 12 pt   | Normal      | Normal  | None       |
| Section headings            | Arial   | 12.5 pt | Bold        | Normal  | Underline  |
| Company name                | Arial   | 12.5 pt | Bold        | Normal  | None       |
| Company description         | Arial   | 12.5 pt | Normal      | Italic  | None       |
| Position/Role               | Arial   | 12.5 pt | Bold        | Italic  | None       |
| Period                      | Arial   | 12.5 pt | Normal      | Italic  | None       |
| Bullet text (body)          | Arial   | 12 pt   | Normal      | Normal  | None       |
| Bullet character (•)        | Roboto  | 10.5 pt | Normal      | Normal  | None       |
| Skills proficiency label    | Arial   | 12 pt   | Bold        | Normal  | None       |
| Skills text                 | Arial   | 12 pt   | Normal      | Normal  | None       |
| Education degree            | Arial   | 12.5 pt | Bold        | Normal  | None       |
| Education institution       | Arial   | 12.5 pt | Normal      | Normal  | None       |
| Language name               | Arial   | 12 pt   | Bold        | Normal  | None       |
| Language details             | Arial   | 12 pt   | Normal      | Normal  | None       |
| Links                       | Arial   | inherit | Normal      | Normal  | Underline  |

---

## 11. Summary of Spacing

| Context                              | Space Before | Space After | Line Height |
|--------------------------------------|--------------|-------------|-------------|
| Name paragraph                       | 0            | 6 pt        | default     |
| Headline paragraph                   | 0            | 6 pt        | default     |
| Contact line                         | 0            | 0           | 1.5         |
| Profiles line                        | 0            | 0           | 1.5         |
| Section heading (SUMMARY, SKILLS)    | 10 pt        | 10 pt       | default     |
| Section heading (WORK EXP, EDU, LANG)| 10 pt        | 5 pt        | default     |
| Summary bullet                       | 0            | 0           | 1.0417      |
| Skills proficiency group             | 4.4 pt       | 0           | 1.0583      |
| Company name line                    | 10 pt*       | 0           | default     |
| Company description                  | 3.7 pt       | 0           | 0.9708      |
| Position/role line                   | 3.7 pt**     | 0           | 0.9708      |
| Experience bullet                    | 0            | 0           | 1.0417      |
| Education bullet                     | 0            | 0           | default     |
| Language bullet                      | 0            | 0           | 1.0417      |

\* First company after section heading has less space (heading's 5pt after suffices).
\** When no company description, position line has 0 space before.

---

## 12. Alignment Rules

| Element                    | Alignment |
|----------------------------|-----------|
| Header (name, headline)   | Center    |
| Contact / Profiles lines   | Center    |
| Section headings           | Left      |
| Company name line          | Left      |
| Company description        | Justified |
| Position/role line         | Left      |
| Bullet points              | Justified |
| Skills groups              | Justified |
| Education items            | Left      |
| Language items             | Left      |

---

## 13. Visual Structure Example

```
                    NICHOLAS NOGUEIRA                        ← 20pt bold, center
             Senior Software Engineer | Back-end             ← 16pt bold, center
  Location: Fortaleza | Phone: +55... | E-mail: ...          ← 12pt, center, bold labels
           LinkedIn: url | Github: url                       ← 12pt, center, blue links

  SUMMARY                                                    ← 12.5pt bold underline CAPS
  ──────────
  • Bullet point text justified across the line...           ← 12pt, justified, LH 1.04
  • Another bullet point...

  SKILLS                                                     ← 12.5pt bold underline CAPS
  ──────
  Proficient: Skill1 (kw), Skill2, Skill3 (kw1, kw2).      ← 12pt, justified, LH 1.06
  Intermediate: Skill4, Skill5 (kw).                         ← bold label, normal text
  Beginner: Skill6, Skill7.

  WORK EXPERIENCE                                            ← 12.5pt bold underline CAPS
  ───────────────
  COMPANY (City, State, Country - Hybrid)                    ← 12.5pt, bold name, italic mode
  Company short description in italic                        ← 12.5pt italic, justified
  Position | Role (MM/YYYY – Present)                        ← 12.5pt bold+italic role, italic period
  • Achievement bullet justified text...                     ← 12pt, justified, LH 1.04
  • Another achievement...

  NEXT COMPANY (City - Remote)                               ← 10pt space before
  Description italic...
  Position | Role (Period)
  • Bullet...

  EDUCATION                                                  ← 12.5pt bold underline CAPS
  ─────────
  • Bachelor degree in Computer Science                      ← 12.5pt bold
  	• University Center Farias Brito (Brazil)               ← 12.5pt normal, tab-indented

  LANGUAGES                                                  ← 12.5pt bold underline CAPS
  ─────────
  • English: advanced | fluent | C1                          ← 12pt, bold name, normal details
  • Portuguese: native | advanced | fluent
  • Spanish: basic communication | fluent reading
```
