# Plan: El Hornito - Technical Debt Annihilation Challenge (Part 1)

**Objective:** Systematically eliminate the majority of identified technical debt, focusing on core stability, test coverage, and UI foundations. This plan prioritizes foundational work to enable future feature development.

**Date:** 2025-07-13

**Author:** GitHub Copilot

---

## 🎯 Phase 1: Stabilize the Core - API & Testing

This phase focuses on bringing our API and core libraries to a stable, well-tested state. Without a solid foundation, new features will be built on shaky ground.

### ✅ **Track 1: API Endpoint Fortification**

- [ ] **`/api/analyze-fridge` Error Handling:** Increase test coverage for error edge cases from 86% to a minimum of 95%.
- [ ] **`/api/validate-api-key` Coverage:** Bolster coverage for error scenarios from 88% to at least 95%.
- [ ] **Fix `validate-api-key.test.ts`:** Resolve all outstanding issues in this test suite.
- [ ] **Error Propagation Testing:** Implement tests to ensure errors propagate correctly through the full API stack.
- [ ] **Standardize Mocks:** Refactor all tests to use `mockMessagesCreate` for consistency.

### ✅ **Track 2: Core Library Coverage**

- [ ] **`lib/api.ts` Coverage:** Create initial, critical test coverage for `lib/api.ts`. Goal: 0% → 50%.
- [ ] **`lib/utils.ts` Enhancement:** Improve test coverage from 25% to 90%.
- [ ] **`lib/settings.ts` Testing:** Implement test coverage for the settings re-export file.

### ✅ **Track 3: Test Suite Cleanup**

- [ ] **Purge Empty Tests:** Remove or implement the following empty test files:
  - [ ] `analyze-fridge-comprehensive.test.ts`
  - [ ] `analyze-fridge-comprehensive-fixed.test.ts`
  - [ ] `analyze-fridge-errors.test.ts`
  - [ ] `analyze-fridge-locale.test.ts`
  - [ ] `analyze-fridge-prompts.test.ts`
  - [ ] `analyze-fridge-settings.test.ts`
  - [ ] `validate-api-key-simple.test.ts`

---

## 🏗️ Phase 2: Build the Foundation - Core UI & i18n

With a stable backend, we can now lay the groundwork for a robust and internationalized user interface.

### ✅ **Track 4: Foundational Setup**

- [ ] **Environment Setup:**
  - [ ] Install all required dependencies (`npm install`).
  - [ ] Configure strict mode in `tsconfig.json`.
  - [ ] Set up `tailwind.config.mjs`.
  - [ ] Configure `eslint.config.mjs` and Prettier.
  - [ ] Create `.env.local` from `.env.example`.
- [ ] **Core Type Definitions (`src/types/index.ts`):**
  - [ ] `AnalyzeFridgeRequest`
  - [ ] `Recipe`
  - [ ] `AnalyzeFridgeResponse`
  - [ ] `ErrorResponse`
  - [ ] `UploadProgress`

### ✅ **Track 5: Basic UI Components**

- [ ] **`LoadingSpinner.tsx`:** Create a reusable loading spinner.
- [ ] **`Button.tsx`:** Implement a general-purpose button with variants.
- [ ] **Error Display:** Create components for displaying API/UI errors.

### ✅ **Track 6: i18n Scaffolding**

- [ ] **Create Translation Files:**
  - [ ] `src/locales/en/common.json`
  - [ ] `src/locales/en/errors.json`
  - [ ] `src/locales/en/settings.json`
  - [ ] `src/locales/en/recipes.json`
  - [ ] `src/locales/en/navigation.json`
- [ ] **Populate Basic Translations:** Add initial keys and values for the English locale.

---

## 🧠 Lessons Learned & Retrospective

_(To be filled out after completion)_

- **What went well?**
- **What could be improved?**
- **Action items for next time:**

---

## ⚠️ Keep in Mind

- **Incremental Commits:** Commit changes frequently with clear, descriptive messages.
- **Test-Driven Mindset:** Write tests before or alongside new code. Don't let coverage slip.
- **Consistency is Key:** Adhere to the established coding style and project structure.
- **Documentation:** As we create core components, add JSDoc comments explaining their purpose, props, and usage.
