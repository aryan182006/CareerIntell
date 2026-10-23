# CareerIntell - Assessment Questions Bank

ASSESSMENTS_DATA = [
    {
        "title": "Python Programming Readiness Assessment",
        "description": "Evaluate core and intermediate Python skills including data structures, generators, list comprehensions, and OOP.",
        "category": "Python",
        "difficulty": "Intermediate",
        "time_limit_minutes": 15,
        "passing_percentage": 70.0,
        "questions": [
            {
                "question_text": "Which data type in Python is immutable?",
                "options": ["list", "set", "tuple", "dictionary"],
                "correct_option_index": 2,
                "explanation": "Tuples in Python cannot be changed after creation, making them immutable.",
                "difficulty": "Beginner",
                "skill_name": "Python"
            },
            {
                "question_text": "What is the output of `bool([])` in Python?",
                "options": ["True", "False", "None", "TypeError"],
                "correct_option_index": 1,
                "explanation": "An empty list evaluates to False in a boolean context.",
                "difficulty": "Beginner",
                "skill_name": "Python"
            },
            {
                "question_text": "What keyword is used to create a generator in Python?",
                "options": ["return", "yield", "generate", "async"],
                "correct_option_index": 1,
                "explanation": "The 'yield' keyword pauses function execution and returns a generator iterator.",
                "difficulty": "Intermediate",
                "skill_name": "Python"
            },
            {
                "question_text": "What is the time complexity of searching an element in a Python dictionary by key on average?",
                "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
                "correct_option_index": 0,
                "explanation": "Python dictionaries are implemented using hash tables, giving average O(1) lookup time.",
                "difficulty": "Intermediate",
                "skill_name": "Python"
            },
            {
                "question_text": "Which built-in function returns both the index and value of items in an iterable?",
                "options": ["zip()", "enumerate()", "map()", "range()"],
                "correct_option_index": 1,
                "explanation": "enumerate() produces pairs of (index, item).",
                "difficulty": "Beginner",
                "skill_name": "Python"
            }
        ]
    },
    {
        "title": "Machine Learning & AI Assessment",
        "description": "Assess conceptual understanding of supervised learning, bias-variance tradeoff, evaluation metrics, and model tuning.",
        "category": "Machine Learning",
        "difficulty": "Intermediate",
        "time_limit_minutes": 20,
        "passing_percentage": 65.0,
        "questions": [
            {
                "question_text": "High variance in a machine learning model is commonly associated with which problem?",
                "options": ["Underfitting", "Overfitting", "Data leakage", "Vanishing gradients"],
                "correct_option_index": 1,
                "explanation": "High variance means the model fits the training data too closely and fails to generalize, which is overfitting.",
                "difficulty": "Intermediate",
                "skill_name": "Machine Learning"
            },
            {
                "question_text": "Which metric is most appropriate for evaluating a highly imbalanced binary classification dataset?",
                "options": ["Accuracy", "F1-Score / PR-AUC", "Mean Squared Error", "R-squared"],
                "correct_option_index": 1,
                "explanation": "In imbalanced classification, accuracy is misleading; F1-score and PR-AUC focus on the minority class performance.",
                "difficulty": "Intermediate",
                "skill_name": "Machine Learning"
            },
            {
                "question_text": "What type of learning does K-Means clustering represent?",
                "options": ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Semi-supervised Learning"],
                "correct_option_index": 1,
                "explanation": "K-Means groups data points based on feature similarity without ground truth labels, making it unsupervised.",
                "difficulty": "Beginner",
                "skill_name": "Machine Learning"
            },
            {
                "question_text": "What technique helps prevent overfitting in decision trees?",
                "options": ["Pruning", "Boosting the learning rate", "Increasing tree depth", "Removing regularization"],
                "correct_option_index": 0,
                "explanation": "Pruning reduces tree complexity by removing sections that have little predictive value.",
                "difficulty": "Intermediate",
                "skill_name": "Machine Learning"
            },
            {
                "question_text": "In regularized linear regression, which penalty corresponds to L1 regularization?",
                "options": ["Ridge (sum of squared coefficients)", "Lasso (sum of absolute coefficients)", "ElasticNet", "Softmax"],
                "correct_option_index": 1,
                "explanation": "Lasso adds an L1 penalty proportional to the sum of absolute values of coefficients, often driving coefficients to zero.",
                "difficulty": "Intermediate",
                "skill_name": "Machine Learning"
            }
        ]
    },
    {
        "title": "SQL & Relational Databases Assessment",
        "description": "Test SQL queries, aggregate functions, joins, indexing, and normalization principles.",
        "category": "SQL",
        "difficulty": "Intermediate",
        "time_limit_minutes": 15,
        "passing_percentage": 70.0,
        "questions": [
            {
                "question_text": "Which SQL clause filters grouped rows after an aggregation?",
                "options": ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
                "correct_option_index": 1,
                "explanation": "HAVING filters records after aggregation, whereas WHERE filters individual rows before aggregation.",
                "difficulty": "Beginner",
                "skill_name": "SQL"
            },
            {
                "question_text": "What type of JOIN returns all records from the left table and matched records from the right table?",
                "options": ["INNER JOIN", "LEFT OUTER JOIN", "RIGHT OUTER JOIN", "FULL JOIN"],
                "correct_option_index": 1,
                "explanation": "LEFT JOIN returns all rows from the left table and matched rows from the right table (NULL if no match).",
                "difficulty": "Beginner",
                "skill_name": "SQL"
            },
            {
                "question_text": "What is the primary benefit of creating an index on a frequently queried column?",
                "options": ["Reduces storage requirements", "Speeds up data retrieval (SELECT)", "Speeds up INSERT and UPDATE operations", "Automatically normalizes the table"],
                "correct_option_index": 1,
                "explanation": "Indexes speed up read/search operations at the cost of slower writes and additional disk space.",
                "difficulty": "Intermediate",
                "skill_name": "SQL"
            },
            {
                "question_text": "Which SQL constraint ensures all values in a column are distinct?",
                "options": ["NOT NULL", "CHECK", "UNIQUE", "DEFAULT"],
                "correct_option_index": 2,
                "explanation": "The UNIQUE constraint ensures all entries in a specified column are distinct.",
                "difficulty": "Beginner",
                "skill_name": "SQL"
            },
            {
                "question_text": "What window function assigns a rank to each row within a partition without gaps in ranking values?",
                "options": ["RANK()", "DENSE_RANK()", "ROW_NUMBER()", "NTILE()"],
                "correct_option_index": 1,
                "explanation": "DENSE_RANK() assigns consecutive rank values without gaps when ties occur.",
                "difficulty": "Intermediate",
                "skill_name": "SQL"
            }
        ]
    }
]
