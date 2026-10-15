-- =============================================================================
-- Academic Study Assistant & Outcome-Based Education (OBE) Schema
-- =============================================================================

-- 1. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    department TEXT NOT NULL DEFAULT 'Computer Science',
    semester TEXT NOT NULL DEFAULT 'Fall 2026',
    credit_hours INT NOT NULL DEFAULT 3,
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS courses_code_idx ON public.courses(code);
CREATE INDEX IF NOT EXISTS courses_instructor_idx ON public.courses(instructor_id);

-- 2. Course Enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (course_id, student_id)
);

CREATE INDEX IF NOT EXISTS enrollments_student_idx ON public.course_enrollments(student_id);

-- 3. Program Learning Outcomes (HEC / PEC PLOs 1-12)
CREATE TABLE IF NOT EXISTS public.plos (
    code TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_percentage NUMERIC(5,2) NOT NULL DEFAULT 60.00
);

-- Seed Standard HEC / PEC 12 PLOs
INSERT INTO public.plos (code, title, description, target_percentage) VALUES
('PLO-1', 'Academic / Engineering Knowledge', 'Apply knowledge of mathematics, science, computing fundamentals and an engineering specialization to solution of complex problems.', 60.00),
('PLO-2', 'Problem Analysis', 'Identify, formulate, research literature, and analyze complex problems reaching substantiated conclusions using first principles.', 60.00),
('PLO-3', 'Design / Development of Solutions', 'Design solutions for complex problems and design system components or processes that meet specified needs with appropriate consideration for public health and safety.', 60.00),
('PLO-4', 'Investigation', 'Conduct investigations of complex problems using research-based knowledge and research methods including design of experiments, analysis and interpretation of data.', 60.00),
('PLO-5', 'Modern Tool Usage', 'Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex engineering activities.', 60.00),
('PLO-6', 'The Engineer & Society', 'Apply reasoning informed by contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities.', 60.00),
('PLO-7', 'Environment & Sustainability', 'Understand the impact of professional engineering solutions in societal and environmental contexts, and demonstrate the knowledge of sustainable development.', 60.00),
('PLO-8', 'Ethics', 'Apply ethical principles and commit to professional ethics and responsibilities and norms of engineering practice.', 60.00),
('PLO-9', 'Individual & Team Work', 'Function effectively as an individual, and as a member or leader in diverse teams and in multi-disciplinary settings.', 60.00),
('PLO-10', 'Communication', 'Communicate effectively on complex engineering activities with the engineering community and with society at large.', 60.00),
('PLO-11', 'Project Management', 'Demonstrate knowledge and understanding of engineering and management principles and apply these to one’s own work, as a member and leader in a team.', 60.00),
('PLO-12', 'Lifelong Learning', 'Recognize the need for, and have the preparation and ability to engage in independent and life-long learning in the broadest context of technological change.', 60.00)
ON CONFLICT (code) DO NOTHING;

-- 4. Course Learning Outcomes (CLOs with Bloom's Taxonomy)
CREATE TABLE IF NOT EXISTS public.clos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    description TEXT NOT NULL,
    blooms_level TEXT NOT NULL,
    domain TEXT NOT NULL DEFAULT 'Cognitive',
    target_percentage NUMERIC(5,2) NOT NULL DEFAULT 60.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (course_id, code)
);

CREATE INDEX IF NOT EXISTS clos_course_idx ON public.clos(course_id);

-- 5. CLO to PLO Mapping Matrix
CREATE TABLE IF NOT EXISTS public.clo_plo_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    clo_id UUID NOT NULL REFERENCES public.clos(id) ON DELETE CASCADE,
    plo_code TEXT NOT NULL REFERENCES public.plos(code) ON DELETE CASCADE,
    weight INT NOT NULL DEFAULT 2 CHECK (weight BETWEEN 1 AND 3),
    UNIQUE (course_id, clo_id, plo_code)
);

-- 6. Academic Materials (Lecture slides, PDFs, Task files)
CREATE TABLE IF NOT EXISTS public.academic_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'slides',
    slide_or_page_count INT NOT NULL DEFAULT 1,
    blob_url TEXT,
    summary TEXT DEFAULT '',
    extracted_text TEXT DEFAULT '',
    mapped_clos TEXT[] DEFAULT '{}',
    mapping_status TEXT NOT NULL DEFAULT 'auto_mapped',
    uploader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS materials_course_idx ON public.academic_materials(course_id);

-- 7. CLO / PLO Auto-Mapping Suggestions & Review Table
CREATE TABLE IF NOT EXISTS public.auto_mapping_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL,
    item_id UUID NOT NULL,
    item_title TEXT NOT NULL,
    suggested_clo_id UUID REFERENCES public.clos(id) ON DELETE CASCADE,
    suggested_clo_code TEXT NOT NULL,
    suggested_blooms_level TEXT NOT NULL,
    suggested_plos JSONB DEFAULT '[]'::jsonb,
    confidence_score NUMERIC(4,3) NOT NULL DEFAULT 0.850,
    rationale TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Quizzes & Quiz Questions
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    topic TEXT NOT NULL,
    material_id UUID REFERENCES public.academic_materials(id) ON DELETE SET NULL,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Quiz Attempts & CLO Performance
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL DEFAULT 0,
    total_questions INT NOT NULL DEFAULT 0,
    correct_count INT NOT NULL DEFAULT 0,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    clo_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS attempts_student_idx ON public.quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS attempts_course_idx ON public.quiz_attempts(course_id);

-- 10. Flashcard Decks & Cards
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    material_id UUID REFERENCES public.academic_materials(id) ON DELETE SET NULL,
    cards JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Flashcard Study Progress
CREATE TABLE IF NOT EXISTS public.flashcard_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mastered_card_ids TEXT[] DEFAULT '{}',
    reviewing_card_ids TEXT[] DEFAULT '{}',
    last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (deck_id, student_id)
);
