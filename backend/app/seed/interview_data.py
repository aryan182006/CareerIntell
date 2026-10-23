# CareerIntell - Comprehensive Industry Interview Questions Bank
# Tagged by Career Role, Skill Name, Round Type, Company Tags, and Evaluation Rubrics

INTERVIEW_QUESTIONS_DATA = [
    # =========================================================================
    # 1. FULL STACK DEVELOPER
    # =========================================================================
    {
        "role_title": "Full Stack Developer",
        "skill_name": "React",
        "round_type": "Technical Core",
        "company_tags": ["Amazon", "Uber", "Flipkart", "TCS Digital"],
        "company_tier": "MAANG / Product",
        "difficulty": "Intermediate",
        "question_text": "How does React's Reconciliation and Fiber Architecture work under the hood, and how does the Virtual DOM optimize UI rendering?",
        "key_concepts": ["Virtual DOM", "Diffing Algorithm", "Fiber Node Tree", "Time Slicing / Concurrency", "Re-render Minimization (useMemo, useCallback)"],
        "interviewer_criteria": "Evaluates whether the candidate understands the internals of modern UI engines rather than just using hooks naively. Tests awareness of rendering bottlenecks and CPU scheduling.",
        "model_answer": "React maintains an in-memory lightweight representation of the UI called the Virtual DOM. When state or props change, React generates a new VDOM tree and diffs it against the current tree using a heuristic O(n) algorithm. Under the Fiber architecture introduced in React 16+, rendering is split into two phases: the interruptible Reconciliation phase (where Fiber nodes are organized as a singly-linked tree and can yield control to the browser event loop for 60fps responsiveness) and the synchronous Commit phase (where actual DOM mutations are applied in one batch). Developers optimize this by maintaining stable keys for lists, avoiding inline arrow functions in tight loops, and memoizing expensive subtrees using React.memo, useMemo, and useCallback.",
        "tips": "Mention that keys should never be array indices when items can reorder or delete, as this breaks diffing heuristics and causes state corruption."
    },
    {
        "role_title": "Full Stack Developer",
        "skill_name": "REST APIs",
        "round_type": "System Design & Scenarios",
        "company_tags": ["Microsoft", "Goldman Sachs", "Infosys Power Programmer", "Swiggy"],
        "company_tier": "MAANG / Product",
        "difficulty": "Advanced",
        "question_text": "Design a resilient idempotency mechanism for high-volume payment and order processing REST APIs to prevent duplicate charges.",
        "key_concepts": ["Idempotency Key (UUID)", "Distributed Lock (Redis)", "Atomic State Machine", "HTTP Status 409 Conflict vs 200 Cached Result", "TTL & Caching"],
        "interviewer_criteria": "Tests practical system design, handling network retries, duplicate client requests, and ensuring exactly-once processing semantics.",
        "model_answer": "To ensure idempotency in mutation endpoints (such as POST /api/v1/orders/checkout), clients generate a unique Idempotency-Key (UUIDv4) in the request header. 1) Upon receiving the request, the API checks Redis for the key using SETNX with a lease TTL (e.g., 60 seconds). 2) If the key is locked and marked 'IN_PROGRESS', the server returns HTTP 409 Conflict or 429 to signal concurrent duplicate in-flight. 3) Once the database transaction and external payment gateway call succeed atomically, the final response payload (status code, headers, body) is cached in Redis associated with that key for 24 hours. 4) If a client retries due to a network timeout, the server detects the completed key and immediately replays the cached 200/201 response without re-executing any business logic.",
        "tips": "Always distinguish between transient network failure retries and genuine duplicate transactions. Emphasize atomicity with database transactions."
    },
    {
        "role_title": "Full Stack Developer",
        "skill_name": "SQL",
        "round_type": "Technical Core",
        "company_tags": ["Amazon", "Oracle", "Cognizant", "JPMorgan Chase"],
        "company_tier": "Fintech & Startups",
        "difficulty": "Intermediate",
        "question_text": "Explain how database indexing (B-Tree vs Hash) works, what a Covering Index is, and when indexes can degrade write performance.",
        "key_concepts": ["B+ Tree Structure", "Logarithmic Search O(log N)", "Covering Index", "Index Fragmentation", "Write Amplification (INSERT/UPDATE overhead)"],
        "interviewer_criteria": "Assesses deep relational database mechanics, performance tuning, and understanding the trade-offs between read and write throughput.",
        "model_answer": "Most relational engines (PostgreSQL, MySQL InnoDB) use B+ Trees for indexes because leaves are linked sequentially, making both equality lookups and range scans O(log N). Hash indexes are O(1) for exact matches but cannot support range queries or sorting. A Covering Index includes all columns referenced in the SELECT, WHERE, and JOIN clauses within the index itself, allowing the query engine to perform an Index-Only Scan without touching the heap/disk table pages. However, every additional index creates write amplification: whenever a row is inserted, updated, or deleted, every associated index tree must be traversed, locked, and rebalanced, which degrades write-heavy workloads and increases storage fragmentation.",
        "tips": "Discuss using EXPLAIN ANALYZE to inspect Sequential Scans vs Index Scans before blind index creation."
    },
    {
        "role_title": "Full Stack Developer",
        "skill_name": "TypeScript",
        "round_type": "Technical Core",
        "company_tags": ["Google", "Microsoft", "Stripe"],
        "company_tier": "MAANG / Product",
        "difficulty": "Intermediate",
        "question_text": "What is the difference between `interface` and `type` in TypeScript, and how do discriminated unions enhance type safety in state management?",
        "key_concepts": ["Declaration Merging", "Discriminated Unions", "Exhaustiveness Checking (never type)", "Utility Types (Omit, Pick, Partial)"],
        "interviewer_criteria": "Tests mastery of TypeScript's type system and ability to model domain states without runtime type bugs.",
        "model_answer": "In TypeScript, `interface` defines an object shape and supports declaration merging (augmenting third-party declarations), whereas `type` aliases can represent primitives, tuples, intersections, and unions. Discriminated unions combine multiple object types that share a single common literal property (the discriminant, e.g., `status: 'loading' | 'success' | 'error'`). In switch or if-blocks, TypeScript narrows the type down to the specific payload. By pairing this with an `exhaustiveCheck(x: never): never` default case, the compiler will refuse to build if any future union state is unhandled.",
        "tips": "Always provide a concise code snippet mental model showing `type State = { status: 'idle' } | { status: 'success'; data: User }`."
    },

    # =========================================================================
    # 2. DATA SCIENTIST
    # =========================================================================
    {
        "role_title": "Data Scientist",
        "skill_name": "Machine Learning",
        "round_type": "Technical Core",
        "company_tags": ["Google", "Amazon", "Microsoft", "TCS Digital"],
        "company_tier": "MAANG / Product",
        "difficulty": "Intermediate",
        "question_text": "How do you detect and handle severe Class Imbalance in classification problems, and why is accuracy a misleading metric?",
        "key_concepts": ["Precision vs Recall", "ROC-AUC & PR-AUC", "SMOTE / Oversampling", "Focal Loss / Class Weights", "Cost-Sensitive Learning"],
        "interviewer_criteria": "Tests practical real-world modeling sense over naive textbook knowledge (e.g., fraud detection where 99.9% of transactions are legitimate).",
        "model_answer": "In datasets with severe class imbalance (such as fraud detection or disease diagnosis), accuracy is deceptive because a dumb baseline predicting only the majority class achieves 99% accuracy while failing 100% of minority cases. To detect this, we inspect class distributions and evaluate using Precision, Recall, F1-Score, and PR-AUC (Precision-Recall Area Under Curve, which is far more sensitive to false positives than ROC-AUC). To remediate imbalance: 1) Data level: Resample using SMOTE (Synthetic Minority Over-sampling Technique) or Tomek links on the training fold strictly after train-test split to prevent leakage. 2) Algorithm level: Apply class weights in loss functions (e.g., `class_weight='balanced'` in scikit-learn, or Focal Loss) penalizing minority errors more heavily. 3) Post-processing: Tune classification decision thresholds based on business cost matrix.",
        "tips": "Crucial gotcha: Never apply SMOTE or oversampling on the entire dataset prior to cross-validation split, as synthetic samples bleed into validation sets (data leakage)."
    },
    {
        "role_title": "Data Scientist",
        "skill_name": "Statistics",
        "round_type": "Technical Core",
        "company_tags": ["Meta", "Netflix", "Amazon", "JPMorgan Chase"],
        "company_tier": "MAANG / Product",
        "difficulty": "Advanced",
        "question_text": "Explain the formulation and pitfalls of A/B Testing: How do you determine sample size, handle multiple hypothesis testing, and guard against p-hacking?",
        "key_concepts": ["Statistical Power (1 - Beta)", "Significance Level (Alpha)", "Minimum Detectable Effect (MDE)", "Bonferroni Correction / FDR", "Peeking Problem (Sequential Testing)"],
        "interviewer_criteria": "Tests statistical rigor, hypothesis validation, and production experimentation hygiene.",
        "model_answer": "In A/B testing, sample size per variant is calculated before launch using Power Analysis, based on baseline conversion rate, desired Significance Level (alpha = 0.05), Statistical Power (1 - beta = 0.80), and Minimum Detectable Effect (MDE). Key pitfalls include: 1) The Peeking Problem: repeatedly checking p-values before reaching the planned sample size dramatically inflates the false positive rate; solutions include strictly fixed sample horizons or adopting Sequential Testing (e.g., Wald's SPRT or Bayesian AB testing). 2) Multiple Hypothesis Testing: testing 20 metrics simultaneously guarantees a false positive by chance at alpha=0.05; this requires Bonferroni correction or Benjamini-Hochberg False Discovery Rate (FDR). 3) Novelty effect vs Cannibalization, requiring holdout groups.",
        "tips": "Emphasize pre-registration of hypothesis, primary North Star metric, and guardrail metrics before running experiments."
    },
    {
        "role_title": "Data Scientist",
        "skill_name": "Python",
        "round_type": "Technical Core",
        "company_tags": ["TCS Digital", "Infosys Power Programmer", "Accenture", "Amazon"],
        "company_tier": "Tier-1 Tech",
        "difficulty": "Intermediate",
        "question_text": "Explain the internal difference between shallow copy, deep copy, and reference assignment in Python, and how the GIL impacts CPU-bound tasks.",
        "key_concepts": ["Memory References (id / pointer)", "copy.copy vs copy.deepcopy", "Global Interpreter Lock (GIL)", "Multiprocessing vs Multithreading", "GIL free-threading (PEP 703)"],
        "interviewer_criteria": "Checks deep language runtime understanding, memory mutation pitfalls, and concurrency scaling.",
        "model_answer": "In Python, simple assignment (`b = a`) only copies the reference pointer; mutating `b` mutates `a`. A shallow copy (`copy.copy(a)`) creates a new container object, but recursively references the original child elements; modifying a nested list inside `b` still mutates `a`. A deep copy (`copy.deepcopy(a)`) recursively duplicates every nested object into new memory addresses. Regarding concurrency, CPython uses the Global Interpreter Lock (GIL) to serialize bytecode execution, preventing race conditions on reference counting. Consequently, CPU-bound tasks (e.g. heavy matrix computations) cannot achieve multi-core parallelism using Python `threading`; they must use `multiprocessing` or native C-extensions like NumPy/PyTorch which release the GIL.",
        "tips": "Mention that Python 3.13 introduces experimental free-threading mode (PEP 703) allowing CPython to run without the GIL."
    },
    {
        "role_title": "Data Scientist",
        "skill_name": "Feature Engineering",
        "round_type": "System Design & Scenarios",
        "company_tags": ["Walmart Labs", "Target", "Fractal Analytics", "Tiger Analytics"],
        "company_tier": "Fintech & Startups",
        "difficulty": "Intermediate",
        "question_text": "Walk me through how you engineer features from raw timestamps, categorical cardinalities, and text fields without introducing data leakage.",
        "key_concepts": ["Temporal Train/Test Split", "Target Encoding with K-Fold Regularization", "Cyclical Sine/Cosine Encodings", "TF-IDF / Embeddings", "Data Leakage Prevention"],
        "interviewer_criteria": "Tests realistic data preprocessing workflows, temporal awareness, and feature engineering depth.",
        "model_answer": "1) Timestamps: Rather than raw integers, extract cyclical features (hour of day, day of week) using sine and cosine transformations (`sin(2*pi*hour/24)`) so midnight connects smoothly to 11 PM. Compute lag features, rolling averages, and time-since-last-event. 2) High-Cardinality Categoricals: Avoid one-hot encoding which blows up dimensional sparsity; instead, use Target Encoding with out-of-fold regularization and additive smoothing to prevent overfitting on rare categories. 3) Text data: Clean, remove stop-words, and either compute TF-IDF or generate dense semantic embeddings via sentence-transformers. 4) Leakage Prevention: Any fit operation (imputation means, standard scalers, target encoders) MUST be fitted strictly on training splits and only transformed onto validation/test sets.",
        "tips": "Always mention temporal split over random K-Fold when time series or transaction data is involved."
    },

    # =========================================================================
    # 3. CLOUD / DEVOPS ENGINEER
    # =========================================================================
    {
        "role_title": "Cloud / DevOps Engineer",
        "skill_name": "Docker",
        "round_type": "Technical Core",
        "company_tags": ["Amazon", "Red Hat", "TCS Digital", "Microsoft"],
        "company_tier": "MAANG / Product",
        "difficulty": "Intermediate",
        "question_text": "How do Docker Multi-Stage builds work, and what security and performance benefits do they provide in production CI/CD pipelines?",
        "key_concepts": ["Multi-Stage Dockerfile", "Layer Caching Optimization", "Distroless / Alpine Base Images", "Non-Root User Execution", "Attack Surface Reduction"],
        "interviewer_criteria": "Evaluates container hygiene, production image size optimization, and security practices.",
        "model_answer": "A Multi-Stage build uses multiple `FROM` instructions in a single Dockerfile. The initial 'builder' stage installs compilation toolchains, package managers, build dependencies (e.g., node_modules, gcc, python build headers) and compiles the application binaries or static bundles. The final stage starts with a fresh, minimal runtime base image (such as Alpine or Google Distroless) and copies only the compiled artifacts from the builder stage via `COPY --from=builder`. This reduces final image sizes from 1GB+ down to 50MB, significantly speeds up container registry pulls and cluster auto-scaling, eliminates build-time CVE vulnerabilities from the production container, and allows running under a dedicated non-root user for security isolation.",
        "tips": "Mention ordering Dockerfile directives from least frequently changed to most frequently changed (e.g. package.json before src/) to maximize layer caching."
    },
    {
        "role_title": "Cloud / DevOps Engineer",
        "skill_name": "Kubernetes",
        "round_type": "System Design & Scenarios",
        "company_tags": ["Google", "Amazon", "Cisco", "Infosys Power Programmer"],
        "company_tier": "MAANG / Product",
        "difficulty": "Advanced",
        "question_text": "Describe the lifecycle of a Kubernetes Pod from kubectl apply to running, and how Liveness vs Readiness probes prevent traffic drops during rollout.",
        "key_concepts": ["API Server & etcd", "Kube-Scheduler Binding", "Kubelet & Container Runtime Interface (CRI)", "Readiness Probe vs Liveness Probe", "Rolling Update Zero-Downtime"],
        "interviewer_criteria": "Tests deep Kubernetes cluster architecture knowledge and deployment zero-downtime reliability.",
        "model_answer": "When `kubectl apply` is executed: 1) The API Server authenticates and validates the manifest, persisting it to `etcd`. 2) The Deployment controller detects the new spec and creates a ReplicaSet. 3) The `kube-scheduler` filters and scores worker nodes based on resource requests and affinity, binding the Pod to a node. 4) The `kubelet` on that node discovers the assignment, requests the CRI (containerd) to pull images and initialize cgroups/namespaces, and configures networking via CNI. 5) Probes: A **Readiness Probe** checks if the application is ready to accept user traffic (e.g., database connection pool warmed); until it passes, the Pod IP is withheld from the Kubernetes Service Endpoints, preventing 502/503 dropped requests during rolling updates. A **Liveness Probe** checks if the application process is in an unrecoverable deadlock; if it fails, kubelet restarts the container.",
        "tips": "Warning: Never configure a liveness probe to check external downstream dependencies (like an external database), otherwise if the database flickers, all pods will cascade restart simultaneously."
    },
    {
        "role_title": "Cloud / DevOps Engineer",
        "skill_name": "CI/CD",
        "round_type": "System Design & Scenarios",
        "company_tags": ["GitLab", "GitHub", "Amazon", "Wipro"],
        "company_tier": "Tier-1 Tech",
        "difficulty": "Intermediate",
        "question_text": "Compare Blue-Green Deployments vs Canary Releases: When would you choose one over the other, and how do you implement automated rollbacks?",
        "key_concepts": ["Blue-Green Environment Switching", "Canary Traffic Splitting (e.g. 95% / 5%)", "Prometheus Automated Canary Analysis (ACA)", "Load Balancer / Ingress Routing", "MTTR (Mean Time to Recovery)"],
        "interviewer_criteria": "Assesses modern deployment methodologies, observability integration, and production risk mitigation.",
        "model_answer": "In **Blue-Green Deployment**, two identical environments exist. Green runs the new release while Blue serves live traffic. After Green passes smoke tests, the router or load balancer switches 100% of traffic instantly to Green. It offers instant rollback (switch back to Blue), but doubles infrastructure costs and can risk sudden database schema incompatibility. In **Canary Release**, the new version is rolled out to a small subset of servers or traffic (e.g., 5%), while 95% remains on stable. Traffic is monitored via metrics (error rates, P99 latency, CPU usage). If error rates remain within SLA, traffic incrementally ramps to 25%, 50%, 100%. If error thresholds spike, the ingress controller immediately diverts traffic back to stable. Canary is ideal for high-scale platforms where full environment replication is cost-prohibitive.",
        "tips": "Mention tools like Argo Rollouts or Flagger with Prometheus metrics for automated canary analysis."
    },

    # =========================================================================
    # 4. MACHINE LEARNING ENGINEER
    # =========================================================================
    {
        "role_title": "Machine Learning Engineer",
        "skill_name": "PyTorch",
        "round_type": "Technical Core",
        "company_tags": ["Meta", "OpenAI", "NVIDIA", "Amazon"],
        "company_tier": "MAANG / Product",
        "difficulty": "Advanced",
        "question_text": "Explain how PyTorch's Autograd computational graph works, the difference between `.detach()` and `torch.no_grad()`, and memory optimization for training.",
        "key_concepts": ["Dynamic Computation Graph (DAG)", "Backpropagation & Gradient Tensors", "torch.no_grad() vs .detach()", "Mixed Precision (torch.cuda.amp)", "Gradient Accumulation"],
        "interviewer_criteria": "Tests practical PyTorch internal mechanics and deep GPU memory constraint management (CUDA OOM troubleshooting).",
        "model_answer": "PyTorch builds a Dynamic Computation Graph (DAG) during the forward pass. Every Tensor with `requires_grad=True` maintains a `grad_fn` pointer tracking the operation that created it, allowing `loss.backward()` to compute gradients via reverse-mode automatic differentiation. `torch.no_grad()` is a context manager that disables graph construction entirely across all operations, reducing CUDA memory during inference. `.detach()` creates a new tensor that shares storage with the original but removes it from the computation graph. For memory optimization under GPU VRAM constraints: 1) Use Automatic Mixed Precision (`torch.cuda.amp.autocast`) to compute in FP16/BF16 while maintaining FP32 master weights. 2) Gradient Accumulation to simulate large batch sizes without extra VRAM. 3) Gradient Checkpointing to recompute activations during backward pass instead of caching them.",
        "tips": "Always mention `optimizer.zero_grad(set_to_none=True)` because setting gradients to None is faster than zeroing memory blocks."
    },
    {
        "role_title": "Machine Learning Engineer",
        "skill_name": "Deep Learning",
        "round_type": "System Design & Scenarios",
        "company_tags": ["Google", "Microsoft", "Uber", "Apple"],
        "company_tier": "MAANG / Product",
        "difficulty": "Advanced",
        "question_text": "Design a low-latency real-time inference serving architecture for an NLP / Transformer model with P99 latency under 25 milliseconds.",
        "key_concepts": ["Model Quantization (INT8 / INT4)", "ONNX Runtime / TensorRT", "Dynamic Batching (Triton Server)", "Embedding Caching (Redis / Vector DB)", "Horizontal Auto-scaling"],
        "interviewer_criteria": "Tests production ML engineering skills: taking research weights and turning them into scalable, low-latency microservices.",
        "model_answer": "1) Model Optimization: Convert the model from PyTorch to ONNX format and optimize with NVIDIA TensorRT. Quantize weights from FP32 to INT8 using Post-Training Quantization (PTQ) or Quantization-Aware Training (QAT), achieving 3-4x speedup with <0.5% accuracy loss. 2) Serving Framework: Deploy on NVIDIA Triton Inference Server or vLLM instead of raw Python FastAPI; Triton manages dynamic request batching with microsecond queues, concurrent model instances per GPU, and zero-copy shared memory. 3) Caching & Architecture: Cache common query embeddings and predictions in Redis. Pre-warm container pods so cold-starts don't blow P99 latency. Run instances across GPU spot clusters behind an Envoy proxy with gRPC protocol for minimum serialization overhead.",
        "tips": "Contrast gRPC with REST: gRPC uses HTTP/2 multiplexing and Protocol Buffers, cutting JSON parsing latency significantly."
    },

    # =========================================================================
    # 5. DATA ANALYST
    # =========================================================================
    {
        "role_title": "Data Analyst",
        "skill_name": "SQL",
        "round_type": "Technical Core",
        "company_tags": ["Amazon", "Deloitte", "TCS", "Accenture", "Flipkart"],
        "company_tier": "Tier-1 Tech",
        "difficulty": "Intermediate",
        "question_text": "Explain Window Functions in SQL: What is the difference between RANK(), DENSE_RANK(), and ROW_NUMBER()? Give a practical business use case.",
        "key_concepts": ["OVER (PARTITION BY ... ORDER BY ...)", "ROW_NUMBER() (unique consecutive)", "RANK() (gaps on ties)", "DENSE_RANK() (no gaps)", "Top-N per Category Query"],
        "interviewer_criteria": "Assesses analytical SQL fluency beyond simple GROUP BY queries.",
        "model_answer": "Window functions perform calculations across a set of table rows related to the current row without collapsing them into a single row like `GROUP BY`. All three assign integer rankings based on an `ORDER BY` clause: 1) `ROW_NUMBER()` assigns a strictly unique sequential integer (1, 2, 3, 4) regardless of ties. 2) `RANK()` assigns identical ranks to ties and skips subsequent positions (e.g., if two items tie for 1st: 1, 1, 3). 3) `DENSE_RANK()` assigns identical ranks to ties but does NOT skip numbers (e.g. 1, 1, 2). Practical business use case: Finding the Top 3 highest spending customers in each geographic region using a CTE with `WHERE ranking <= 3`.",
        "tips": "Point out that window functions are evaluated after WHERE and HAVING clauses, which is why a Subquery or CTE is mandatory to filter by the generated rank."
    },
    {
        "role_title": "Data Analyst",
        "skill_name": "Data Visualization",
        "round_type": "System Design & Scenarios",
        "company_tags": ["Goldman Sachs", "McKinsey", "Power BI / Tableau", "EY"],
        "company_tier": "Fintech & Startups",
        "difficulty": "Intermediate",
        "question_text": "How do you design an executive-level KPI dashboard that avoids cognitive overload, and how do you ensure the underlying data remains consistent?",
        "key_concepts": ["Star Schema / Kimball Modeling", "Actionable vs Vanity Metrics", "Progressive Disclosure UI", "Data Refresh Schedules & ETL SLAs", "Data Lineage & Governance"],
        "interviewer_criteria": "Tests data communication, dashboard UX principles, and enterprise data warehouse modeling.",
        "model_answer": "1) Visual Design: Follow the 5-second rule and the inverted pyramid principle. Place 3-4 primary North Star business KPIs (Revenue, Retention, CAC) at the top with clear trend comparison arrows against targets or previous periods. Use progressive disclosure: high-level aggregated charts in view, with interactive cross-filtering and drill-down tooltips for deep investigation. 2) Data Modeling: Build the reporting layer on a clean Star Schema (Fact tables linked to Dimension tables) rather than querying wide, denormalized transactional tables. 3) Governance: Establish clear definitions for metrics in a shared semantic catalog (e.g., 'What defines an active user?') to prevent discrepancies between departments. Set up scheduled ETL refreshes with automated data freshness alert webhooks.",
        "tips": "Emphasize avoiding 3D charts, pie charts with more than 4 slices, and high-saturation colors that distract from outliers."
    },

    # =========================================================================
    # 6. RESUME & PROJECT DEFENSE ROUND (UNIVERSAL & PRACTICAL)
    # =========================================================================
    {
        "role_title": "All Roles",
        "skill_name": "Project",
        "round_type": "Project Defense",
        "company_tags": ["Google", "Amazon", "Microsoft", "TCS Digital", "Infosys"],
        "company_tier": "MAANG / Product",
        "difficulty": "Intermediate",
        "question_text": "Walk me through the architecture of the primary technical project listed on your resume: Why did you choose that specific tech stack over alternatives, and what trade-offs did you accept?",
        "key_concepts": ["Architecture Justification", "Technology Trade-offs (e.g. SQL vs NoSQL, REST vs GraphQL)", "Performance Bottlenecks Encountered", "Testing & Deployment Setup", "Quantifiable Impact Metrics"],
        "interviewer_criteria": "Hiring managers ask this to verify authentic project ownership, engineering maturity, and to detect whether code was just blindly copy-pasted from tutorials.",
        "model_answer": "Structure your answer in 4 parts: 1) Problem Statement & Scope: Define the specific problem your project solved and target user persona. 2) Architecture & Stack Justification: Explain why you picked your stack (e.g., 'We chose FastAPI over Django because our application required high asynchronous I/O concurrency for PDF parsing and LLM API calls with lightweight footprint; we chose PostgreSQL for relational integrity between skills, jobs, and student scores'). 3) Engineering Bottleneck: Describe a genuine hurdle you resolved (e.g., 'Initial PDF parsing with regex caused false positives on skill aliases like 'C' in words like 'Cloud'; we resolved this by enforcing word-boundary regex tokenization and canonical taxonomy normalization'). 4) Measurable Outcome: State quantifiable results (e.g., 'Achieved 94% parsing accuracy and sub-200ms API response times').",
        "tips": "Never say 'I chose this framework because it was the only one I knew'. Frame choices in terms of ecosystem maturity, type safety, community libraries, and architectural fit."
    },
    {
        "role_title": "All Roles",
        "skill_name": "Problem Solving",
        "round_type": "Project Defense",
        "company_tags": ["Amazon", "Microsoft", "JPMorgan Chase", "Capgemini"],
        "company_tier": "Tier-1 Tech",
        "difficulty": "Intermediate",
        "question_text": "Tell me about a time your application crashed, experienced memory exhaustion, or failed a deployment. How did you diagnose the root cause and prevent it?",
        "key_concepts": ["Root Cause Analysis (5 Whys)", "Log Aggregation & Profiling", "Post-Mortem Documentation", "Regression Testing", "Graceful Degradation"],
        "interviewer_criteria": "Tests troubleshooting methodology, resilience under pressure, and continuous improvement.",
        "model_answer": "During load testing of our student assessment API, the service suddenly began returning HTTP 504 Gateway Timeouts and process memory ballooned until the container was killed by Linux OOM. 1) Diagnostic phase: I inspected container logs and correlated timestamps with active requests. By reproducing the issue locally using a Python memory profiler (`tracemalloc`), I discovered an unclosed database connection pool leak: database sessions inside background async tasks weren't wrapped in context managers, leaving orphaned open TCP connections. 2) Resolution: I refactored session initialization to use `async with async_session_factory()` ensuring guaranteed cleanup even on uncaught exceptions. 3) Prevention: I instituted automated integration tests verifying connection pool release and added Prometheus connection pool metrics with Grafana alerts.",
        "tips": "Follow the structured timeline: Symptom -> Metric Inspection -> Root Cause Isolation -> Immediate Fix -> Long-term Prevention."
    },

    # =========================================================================
    # 7. BEHAVIORAL & HR (STAR METHOD & LEADERSHIP)
    # =========================================================================
    {
        "role_title": "All Roles",
        "skill_name": "Communication",
        "round_type": "Behavioral (STAR)",
        "company_tags": ["Amazon", "Google", "Microsoft", "TCS", "Cognizant"],
        "company_tier": "MAANG / Product",
        "difficulty": "Beginner",
        "question_text": "Tell me about a situation where you had a strong technical disagreement with a team member or mentor regarding architecture. How did you resolve it?",
        "key_concepts": ["STAR Method (Situation, Task, Action, Result)", "Objective Data over Ego", "Active Listening", "Disagree and Commit (Amazon Principle)", "Collaborative Alignment"],
        "interviewer_criteria": "Tests emotional intelligence, constructive communication, team collaboration, and ability to disagree professionally.",
        "model_answer": "Situation: During our capstone project, my teammate wanted to use MongoDB for rapid schema flexibility, whereas I advocated for PostgreSQL because our domain relied heavily on relational joins between student profiles, skill gap taxonomies, and job descriptions. Task: We needed to settle on a persistence layer without delaying our sprint milestone. Action: Instead of debating subjectively, I proposed building a quick proof-of-concept benchmark: we modeled a complex query (retrieving a student's missing skills compared against 50 job descriptions) in both systems. The benchmark showed PostgreSQL's relational schema and index lookups reduced query latency from 450ms down to 35ms and guaranteed foreign-key integrity. I listened to his concerns about schema migration friction and introduced Alembic to automate migrations smoothly. Result: We agreed on PostgreSQL, met our delivery deadline with zero integrity bugs, and established benchmark-driven decision making as a team rule.",
        "tips": "Always keep the STAR balance: Situation 15%, Task 15%, Action 50%, Result 20%. Ensure the 'Action' highlights YOUR proactive steps."
    },
    {
        "role_title": "All Roles",
        "skill_name": "Problem Solving",
        "round_type": "Behavioral (STAR)",
        "company_tags": ["Amazon", "Google", "Infosys", "Deloitte"],
        "company_tier": "MAANG / Product",
        "difficulty": "Intermediate",
        "question_text": "Describe a scenario where you faced a tight deadline or ambiguity with insufficient requirements. How did you prioritize what to build?",
        "key_concepts": ["STAR Method", "Scope Prioritization (MoSCoW Method)", "Stakeholder Alignment", "Iterative MVP Delivery", "Managing Ambiguity"],
        "interviewer_criteria": "Evaluates delivery under pressure, customer obsession, and ability to navigate ambiguous project requirements.",
        "model_answer": "Situation: Two weeks before our mid-term project evaluation, our stakeholder requested that our analytics platform also support real-time ATS resume keyword scoring, but provided no formal specifications. Task: As the project lead, I had to clarify requirements, manage scope creep, and deliver a demonstrable feature without jeopardizing the existing roadmap. Action: I scheduled a 30-minute alignment session with the mentor, presenting three scope tiers using the MoSCoW framework: Must-have (PDF text extraction and canonical skill matching), Should-have (readiness score calculation), and Could-have (interactive graphical radar chart). By demonstrating that the Must-haves would satisfy 90% of the placement evaluation rubric, we agreed to defer the visual radar chart to phase 2. I set up daily 10-minute standups and broke tasks into 2-day micro-deliverables. Result: We shipped the complete resume parsing and score pipeline 2 days ahead of schedule, scoring an 'A' grade from the evaluation committee.",
        "tips": "Emphasize communication and proactive prioritization rather than pulling an unhealthy all-nighter."
    }
]
