"""
Research Methods in Psychology - Terminology Dictionary
Comprehensive list of technical terms to preserve during text processing.
"""

RESEARCH_TERMINOLOGY = {
    # Statistical Tests
    "t-test", "t-tests", "T-test", "T-tests",
    "ANOVA", "anova", "MANOVA", "manova", "ANCOVA", "ancova",
    "chi-square", "chi-squared", "χ²", "chi square test",
    "F-test", "F-tests", "f-test", "f-tests",
    "Mann-Whitney", "Mann-Whitney U", "Wilcoxon",
    "Kruskal-Wallis", "Friedman test",
    "post-hoc", "post hoc", "Tukey", "Bonferroni", "Scheffé",
    "z-test", "Z-test", "z-score", "Z-score",
    
    # Statistical Concepts
    "p-value", "p-values", "P-value", "P-values",
    "alpha level", "significance level", "α",
    "effect size", "Cohen's d", "Cohen's D", "eta-squared", "η²",
    "power analysis", "statistical power",
    "Type I error", "Type II error", "Type 1 error", "Type 2 error",
    "null hypothesis", "alternative hypothesis", "H0", "H1", "Ha",
    "confidence interval", "CI", "95% CI", "99% CI",
    "standard deviation", "SD", "standard error", "SE", "SEM",
    "variance", "covariance", "standard score",
    "degrees of freedom", "df",
    "one-tailed", "two-tailed", "one-sided", "two-sided",
    "parametric", "non-parametric", "nonparametric",
    
    # Correlation and Regression
    "correlation", "correlate", "correlates", "correlated",
    "Pearson", "Pearson's r", "Pearson correlation",
    "Spearman", "Spearman's rho", "Spearman rank correlation",
    "correlation coefficient", "r-value", "R-value",
    "regression", "linear regression", "multiple regression",
    "logistic regression", "polynomial regression",
    "R-squared", "R²", "adjusted R-squared",
    "regression coefficient", "beta weight", "β",
    "predictor variable", "criterion variable", "outcome variable",
    "multicollinearity", "heteroscedasticity", "homoscedasticity",
    
    # Research Designs
    "experimental design", "quasi-experimental", "pre-experimental",
    "between-subjects", "between subjects", "between-groups",
    "within-subjects", "within subjects", "repeated measures",
    "mixed design", "factorial design", "2x2", "3x2",
    "randomized controlled trial", "RCT",
    "double-blind", "single-blind", "blind", "blinded",
    "placebo", "placebo-controlled",
    "longitudinal", "cross-sectional", "time-series",
    "cohort study", "case-control", "case study",
    "naturalistic observation", "participant observation",
    "field experiment", "laboratory experiment", "lab experiment",
    
    # Variables
    "independent variable", "IV", "IVs",
    "dependent variable", "DV", "DVs",
    "confounding variable", "confound", "confounds",
    "extraneous variable", "control variable",
    "mediator", "moderator", "mediation", "moderation",
    "categorical variable", "continuous variable",
    "discrete variable", "dichotomous variable",
    "nominal", "ordinal", "interval", "ratio",
    
    # Validity and Reliability
    "validity", "valid", "validated",
    "internal validity", "external validity",
    "construct validity", "content validity", "criterion validity",
    "face validity", "concurrent validity", "predictive validity",
    "convergent validity", "discriminant validity", "divergent validity",
    "ecological validity", "population validity",
    "reliability", "reliable",
    "test-retest reliability", "inter-rater reliability",
    "internal consistency", "split-half reliability",
    "Cronbach's alpha", "Cronbach alpha", "α coefficient",
    "kappa", "Cohen's kappa", "κ",
    "measurement error", "systematic error", "random error",
    
    # Sampling
    "random sampling", "random sample", "probability sampling",
    "simple random sampling", "stratified sampling", "cluster sampling",
    "systematic sampling", "multistage sampling",
    "convenience sampling", "purposive sampling", "quota sampling",
    "snowball sampling", "volunteer sampling",
    "sample size", "sample bias", "sampling error",
    "population", "target population", "accessible population",
    "generalizability", "generalize", "generalizable",
    "representative sample", "random assignment", "random allocation",
    
    # Measurement Scales
    "Likert scale", "Likert-type", "Likert",
    "semantic differential", "visual analog scale", "VAS",
    "rating scale", "ordinal scale", "interval scale", "ratio scale",
    "dichotomous scale", "binary scale",
    "self-report", "self-report measure", "questionnaire",
    "survey", "inventory", "assessment tool",
    "psychometric", "psychometrics",
    
    # Data Collection
    "operationalization", "operationalize", "operationalized",
    "manipulation", "manipulate", "manipulated",
    "observation", "observational method", "behavioral observation",
    "archival research", "archival data", "secondary data",
    "interview", "structured interview", "semi-structured interview",
    "focus group", "case study method",
    
    # Ethics
    "IRB", "Institutional Review Board", "ethics committee",
    "informed consent", "assent", "consent form",
    "debriefing", "debrief",
    "confidentiality", "anonymity", "anonymous",
    "risk-benefit analysis", "minimal risk",
    "vulnerable population", "protected population",
    "deception", "deceptive", "deceive",
    "APA Ethics Code", "Belmont Report",
    "HIPAA", "human subjects", "animal subjects",
    
    # Data Analysis
    "descriptive statistics", "inferential statistics",
    "mean", "median", "mode", "average",
    "range", "interquartile range", "IQR",
    "percentile", "quartile", "quintile",
    "normal distribution", "bell curve", "Gaussian distribution",
    "skewness", "kurtosis", "skewed", "bimodal", "multimodal",
    "outlier", "outliers", "extreme value",
    "data transformation", "log transformation", "square root transformation",
    "standardization", "normalization", "z-score transformation",
    "coding", "recoding", "dummy coding", "effect coding",
    "missing data", "listwise deletion", "pairwise deletion", "imputation",
    
    # Research Process
    "hypothesis", "hypotheses", "research question",
    "literature review", "systematic review", "meta-analysis",
    "pilot study", "pilot test", "pretest",
    "replication", "replicate", "replicability", "reproducibility",
    "peer review", "peer-reviewed", "publication bias",
    "theoretical framework", "conceptual framework",
    "operational definition", "construct", "constructs",
    
    # Specific Psychological Measures (commonly used in research methods texts)
    "Beck Depression Inventory", "BDI",
    "MMPI", "Minnesota Multiphasic Personality Inventory",
    "Wechsler", "WAIS", "WISC",
    "Stanford-Binet", "IQ test",
    "Big Five", "NEO-PI-R", "five-factor model",
    
    # Common Abbreviations
    "et al.", "et al", "e.g.", "i.e.", "vs.", "cf.",
    "M", "SD", "N", "n", "p", "r", "R", "F", "t", "d", "β",
    
    # Software/Tools (often mentioned)
    "SPSS", "SAS", "R", "Python", "MATLAB", "Stata",
    "Excel", "G*Power",
    
    # Publication/Citation
    "APA style", "APA format", "APA 7th edition",
    "DOI", "digital object identifier",
    "abstract", "citation", "reference", "bibliography",
    
    # COVID-19 era terms (recent addition to research)
    "COVID-19", "SARS-CoV-2", "pandemic",
    "telehealth", "online survey", "web-based",
    "Qualtrics", "MTurk", "Mechanical Turk", "Prolific",
    
    # Additional Design Terms
    "counterbalancing", "Latin square", "order effects",
    "carryover effect", "practice effect", "fatigue effect",
    "demand characteristics", "social desirability", "response bias",
    "ceiling effect", "floor effect", "restriction of range",
    "attrition", "dropout", "mortality threat",
    "history threat", "maturation threat", "testing threat",
    "instrumentation threat", "regression to the mean",
    "selection bias", "self-selection", "volunteer bias",
    
    # Advanced Statistical Methods
    "structural equation modeling", "SEM",
    "hierarchical linear modeling", "HLM", "multilevel modeling",
    "factor analysis", "exploratory factor analysis", "EFA",
    "confirmatory factor analysis", "CFA",
    "principal component analysis", "PCA",
    "cluster analysis", "discriminant analysis",
    "survival analysis", "Cox regression",
    "time series analysis", "autoregression",
    "Bayesian", "Bayesian statistics", "prior", "posterior",
    "likelihood", "maximum likelihood", "MLE",
    "bootstrapping", "resampling", "permutation test",
    
    # Effect Sizes
    "odds ratio", "OR", "risk ratio", "relative risk", "RR",
    "hazard ratio", "HR",
    "phi coefficient", "Cramér's V",
    "partial eta squared", "omega squared",
    "Glass's delta", "Hedges' g",
    
    # Research Quality
    "preregistration", "preregistered", "registered report",
    "open science", "open data", "transparency",
    "CONSORT", "PRISMA", "reporting guidelines",
}

# Convert to case-insensitive set for faster lookup
RESEARCH_TERMINOLOGY_LOWER = {term.lower() for term in RESEARCH_TERMINOLOGY}

def is_research_term(word: str) -> bool:
    """
    Check if a word is a research methods term.
    Case-insensitive comparison.
    """
    return word.lower() in RESEARCH_TERMINOLOGY_LOWER

def get_all_terms() -> set:
    """Return the complete set of research terminology."""
    return RESEARCH_TERMINOLOGY.copy()

def get_terms_lowercase() -> set:
    """Return the complete set of research terminology in lowercase."""
    return RESEARCH_TERMINOLOGY_LOWER.copy()