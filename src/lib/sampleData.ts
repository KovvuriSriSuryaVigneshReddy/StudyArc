import { StudyStudioData } from "@/types";

export const SAMPLE_STEM_LECTURE = `Lecture 07: Gradient Descent, Loss Functions & Backpropagation in Deep Neural Networks
Instructor: Dr. Sarah Chen | Dept of Computer Science & AI

1. Optimization Objective in Supervised Learning
Given a training dataset D = {(x_i, y_i)}_{i=1}^N and a parameterized model f(x; θ), where θ ∈ R^d represents the network weights and biases, our goal is to minimize the empirical risk (loss function) L(θ) = (1/N) ∑_{i=1}^N ℓ(f(x_i; θ), y_i).
Common loss functions include:
- Mean Squared Error (MSE) for regression: L_MSE = (1/2N) ∑ (y_i - ŷ_i)^2
- Binary Cross-Entropy (BCE) for binary classification: L_BCE = - (1/N) ∑ [y_i log(ŷ_i) + (1 - y_i) log(1 - ŷ_i)]
- Categorical Cross-Entropy for multiclass classification with softmax output: L_CE = - ∑ y_{i,c} log(p_{i,c})

2. Gradient Descent Mechanics
The standard gradient descent update rule calculates the gradient of the loss with respect to all parameters:
θ_{t+1} = θ_t - η ∇_θ L(θ_t), where η > 0 is the learning rate hyperparameter.
In practice, Batch Gradient Descent is computationally prohibitive for massive datasets. Hence, we use Mini-Batch Stochastic Gradient Descent (SGD):
∇_θ L_B(θ) = (1/|B|) ∑_{i ∈ B} ∇_θ ℓ(f(x_i; θ), y_i)

Key challenges with basic SGD:
1. High variance in gradient updates when batch size |B| is small.
2. Pathological curvature (ravines) where gradient oscillates orthogonally to the local minimum.
3. Saddle points in high-dimensional non-convex loss surfaces.
Solution: Momentum accelerates SGD in the relevant direction and dampens oscillations:
v_{t+1} = γ v_t + η ∇_θ L(θ_t), θ_{t+1} = θ_t - v_{t+1}
Adaptive Optimizers like Adam (Adaptive Moment Estimation) combine first moment (momentum) and second moment (uncentered variance) estimates with bias corrections:
m_t = β_1 m_{t-1} + (1 - β_1) g_t
v_t = β_2 v_{t-1} + (1 - β_2) g_t^2
θ_{t+1} = θ_t - (η / (sqrt(v̂_t) + ε)) * m̂_t

3. Backpropagation Algorithm
Backpropagation is an efficient application of the multivariate chain rule from calculus to compute gradients of the scalar loss L with respect to all layer weights W^[l] and biases b^[l].
Consider layer l with activation a^[l] = σ(z^[l]), where z^[l] = W^[l] a^[l-1] + b^[l].
Forward Pass:
z^[l] = W^[l] a^[l-1] + b^[l]
a^[l] = σ(z^[l])

Backward Pass (Error propagation):
Define error vector δ^[l] = ∂L / ∂z^[l].
For output layer L:
δ^[L] = ∇_{a^[L]} L ⊙ σ'(z^[L])
For hidden layer l < L:
δ^[l] = ((W^[l+1])^T δ^[l+1]) ⊙ σ'(z^[l])

Gradient computation:
∂L / ∂W^[l] = δ^[l] (a^[l-1])^T
∂L / ∂b^[l] = δ^[l]

4. Vanishing and Exploding Gradient Dilemma
When using deep networks with saturating activations (sigmoid or tanh):
σ'(z) = σ(z)(1 - σ(z)) <= 0.25
As δ^[l] propagates backward through many layers, repeated multiplication by small weights and derivative values <= 0.25 causes exponential decay of gradients towards zero (vanishing gradients), stalling learning in early layers.
Mitigations:
- Non-saturating activation functions like ReLU: f(x) = max(0, x), LeakyReLU, GELU.
- Proper weight initialization: He initialization for ReLU (Var(W) = 2/n_in) and Xavier/Glorot for tanh.
- Batch Normalization and Residual Connections (ResNets: a^[l] = σ(z^[l] + a^[l-1])).`;

export const SAMPLE_HUMANITIES_LECTURE = `PHIL 210: Political Philosophy & Social Contract Theory
Prof. Marcus Vance | Lecture 14: The State of Nature & Sovereign Authority: Hobbes vs. Locke vs. Rousseau

1. The Foundation of Political Legitimacy
The central question of 17th and 18th-century social contract theory is: By what right does any government exercise coercive power over free individuals?
Rather than invoking the Divine Right of Kings, contractarians construct a hypothetical pre-political condition called the 'State of Nature' to uncover what human life would be without institutional authority, thereby deriving the rationale and boundaries of legitimate political rule.

2. Thomas Hobbes (Leviathan, 1651): Absolute Sovereignty as Salvation
- The Human Condition: Driven by self-preservation, fear, and 'a perpetual and restless desire of power after power, that ceaseth only in death.'
- The State of Nature: A state of war of all against all ('bellum omnium contra omnes'). With no common power to enforce justice, there is no property, industry, or culture. Life is 'solitary, poor, nasty, brutish, and short.'
- The Social Contract: Rational agents recognize the Law of Nature: to seek peace. Individuals mutually surrender their natural liberty to an undivided, absolute sovereign (the Leviathan).
- Limits: The sovereign's power cannot be legitimately contested by subjects, except when the sovereign directly attempts to kill or deprive the subject of basic survival. Hobbes rejects any right of revolution.

3. John Locke (Second Treatise of Government, 1689): Conditional Trust & Natural Rights
- The State of Nature: A state of perfect freedom and equality, governed by the Law of Nature (reason), which dictates that no one ought to harm another in their life, health, liberty, or possessions.
- The Inconveniences: Without an impartial judge, individuals must enforce the law of nature themselves, leading to disproportionate retaliation and perpetual instability.
- Property & Labor Theory: Ownership is justified when a person mixes their labor with unowned natural resources, provided 'enough and as good' is left for others.
- The Social Contract: Individuals surrender only their executive power of punishing infractions, creating a fiduciary trust whose sole purpose is preserving life, liberty, and property.
- Right of Revolution: If the legislative acts contrary to this trust, citizens retain the moral and political right to overthrow and reconstitute the government.

4. Jean-Jacques Rousseau (On the Social Contract, 1762): Popular Sovereignty & The General Will
- Critique of Civilization: Hobbes and Locke projected corrupted bourgeois desires backward into natural man. The savage human was peaceful, self-sufficient (amour de soi), and endowed with natural pity. Private property ('This is mine') introduced inequality, pride (amour-propre), and bondage: 'Man is born free, and everywhere he is in chains.'
- The Legitimate Republic: The social contract must allow each person to unite with all while remaining as free as before.
- The General Will (Volonté Générale): Citizens collectively deliberate not on private factional interests, but on the common good. True freedom is obedience to self-prescribed law. Any who refuse may be 'forced to be free.'`;

export const MOCK_STEM_RESULT: StudyStudioData = {
  topic: "Deep Learning Optimization & Backpropagation",
  read_time_minutes: 6,
  executive_summary:
    "Optimization in deep neural networks revolves around minimizing empirical risk $\\mathcal{L}(\\theta)$ via loss functions tailored to specific tasks (MSE for regression, Cross-Entropy for classification). The standard optimization engine is Gradient Descent, which iteratively updates parameter weights in the negative gradient direction.\n\nBackpropagation systematically executes the multivariate calculus chain rule to calculate exact gradients layer-by-layer from output to input. Critical historical impediments like the vanishing gradient problem in deep architectures are remedied through non-saturating activations (ReLU: $f(x) = \\max(0, x)$), modern initialization techniques (He initialization: $\\text{Var}(W) = \\frac{2}{n_{\\text{in}}}$), and adaptive optimizers (Adam).",
  high_yield_takeaways: [
    "Gradient Descent updates weights via $\\theta_{t+1} = \\theta_t - \\eta \\nabla_\\theta \\mathcal{L}(\\theta_t)$, utilizing mini-batches to balance gradient accuracy and compute efficiency.",
    "Momentum accelerates updates along consistent trajectories and dampens orthogonal oscillations through velocity accumulation: $v_{t+1} = \\gamma v_t + \\eta \\nabla_\\theta \\mathcal{L}(\\theta_t)$.",
    "Adam combines exponentially decaying first moments ($m_t = \\beta_1 m_{t-1} + (1 - \\beta_1) g_t$) and second raw moments ($v_t = \\beta_2 v_{t-1} + (1 - \\beta_2) g_t^2$) for adaptive parameter scaling.",
    "Backpropagation computes intermediate error vectors $\\delta^{[l]} = \\frac{\\partial \\mathcal{L}}{\\partial z^{[l]}}$ backwards, avoiding redundant matrix computations.",
    "Vanishing gradients occur when deep layers cascade derivatives bounded below 1 (e.g., sigmoid $\\sigma'(z) \\le 0.25$), mitigated by ReLU and residual skip connections ($a^{[l]} = \\sigma(z^{[l]} + a^{[l-1]})$)."
  ],
  key_formulas_or_definitions: [
    {
      term: "Empirical Risk Minimization",
      definition: "Minimizing the average loss over training examples: $\\mathcal{L}(\\theta) = \\frac{1}{N} \\sum_{i=1}^N \\ell(f(x_i; \\theta), y_i)$ to approximate the true data distribution."
    },
    {
      term: "Gradient Update Rule",
      definition: "$\\theta_{t+1} = \\theta_t - \\eta \\nabla_\\theta \\mathcal{L}(\\theta_t)$, where $\\eta > 0$ represents the step size or learning rate."
    },
    {
      term: "Backprop Error Vector ($\\delta^{[l]}$)",
      definition: "$\\delta^{[l]} = ((W^{[l+1]})^T \\delta^{[l+1]}) \\odot \\sigma'(z^{[l]})$, representing the sensitivity of the loss to pre-activation inputs."
    },
    {
      term: "Weight Gradient Equation",
      definition: "$\\frac{\\partial \\mathcal{L}}{\\partial W^{[l]}} = \\delta^{[l]} (a^{[l-1]})^T$, the outer product of the current layer's error vector and the previous layer's activations."
    },
    {
      term: "He Initialization",
      definition: "Variance scaling scheme $\\text{Var}(W) = \\frac{2}{n_{\\text{in}}}$ specifically derived to keep activation variance constant across layers when using ReLU."
    },
    {
      term: "Adam Parameter Update",
      definition: "$\\theta_{t+1} = \\theta_t - \\frac{\\eta}{\\sqrt{\\hat{v}_t} + \\varepsilon} \\hat{m}_t$, adaptively scaling step sizes according to historical gradient variance."
    }
  ],
  trapsAndGotchas: [
    {
      concept: "Sigmoid/Tanh Derivative Saturation",
      commonTrap: "Assuming that deeper networks always learn better representations, ignoring that sigmoid maximum slope is $\\sigma'(z) \\le 0.25$.",
      proTip: "Through $L$ layers, gradients decay exponentially as $(0.25)^L \\to 0$. Use non-saturating ReLU ($f(x) = \\max(0, x)$) or residual connections."
    },
    {
      concept: "Matrix Dimensions in Backprop",
      commonTrap: "Transposing activations improperly when computing $\\frac{\\partial \\mathcal{L}}{\\partial W^{[l]}}$, creating mismatched tensor shapes.",
      proTip: "Always check tensor dimensions: $(\\delta^{[l]})_{n_l \\times 1} \\times ((a^{[l-1]})^T)_{1 \\times n_{l-1}} = (n_l \\times n_{l-1})$, identical to $W^{[l]}$."
    },
    {
      concept: "Batch Size & Learning Rate Coupling",
      commonTrap: "Increasing mini-batch size $|B|$ without adjusting learning rate $\\eta$, causing premature convergence to sharp local minima.",
      proTip: "Apply the Linear Scaling Rule: when multiplying batch size by $k$, scale learning rate by $k$ ($\\eta \\leftarrow k\\eta$) with warmup."
    }
  ],
  practice_quiz: [
    {
      id: 1,
      question: "Why does the standard sigmoid activation function contribute significantly to the vanishing gradient problem in deep networks?",
      options: [
        "A. Its output values are unbounded in the positive range",
        "B. Its maximum first derivative is $\\sigma'(z) \\le 0.25$, causing gradient signals to diminish exponentially across multiple layers",
        "C. It introduces non-differentiable points at the origin ($x = 0$)",
        "D. It requires exponential matrix inversion during the forward pass"
      ],
      correct_index: 1,
      explanation: "Since $\\sigma'(z) = \\sigma(z)(1 - \\sigma(z))$ has a global maximum of $0.25$, chain-rule multiplications through deep layers rapidly decay toward zero."
    },
    {
      id: 2,
      question: "In the backpropagation backward pass, what is the mathematical definition of the layer error vector $\\delta^{[l]}$?",
      options: [
        "A. $\\frac{\\partial \\mathcal{L}}{\\partial W^{[l]}}$",
        "B. $\\frac{\\partial \\mathcal{L}}{\\partial a^{[l]}}$",
        "C. $\\frac{\\partial \\mathcal{L}}{\\partial z^{[l]}}$",
        "D. $\\frac{\\partial z^{[l]}}{\\partial b^{[l]}}$"
      ],
      correct_index: 2,
      explanation: "The error vector $\\delta^{[l]}$ is explicitly defined as the partial derivative of the scalar loss $\\mathcal{L}$ with respect to the linear pre-activation vector $z^{[l]}$: $\\delta^{[l]} \\equiv \\frac{\\partial \\mathcal{L}}{\\partial z^{[l]}}$."
    },
    {
      id: 3,
      question: "Which mechanism allows the Adam optimizer to adapt individual learning rates for each parameter?",
      options: [
        "A. Dividing updates by the square root of the exponentially moving second moment estimate $(\\sqrt{\\hat{v}_t} + \\varepsilon)$",
        "B. Resetting momentum to zero whenever loss oscillations are detected",
        "C. Dynamically doubling the batch size at each epoch",
        "D. Inverting the Hessian matrix using stochastic approximations"
      ],
      correct_index: 0,
      explanation: "Adam divides the first moment estimate by the root of the second raw moment estimate $(\\hat{v}_t)$, scaling down steps for frequently updated weights: $\\theta_{t+1} = \\theta_t - \\frac{\\eta}{\\sqrt{\\hat{v}_t} + \\varepsilon} \\hat{m}_t$."
    },
    {
      id: 4,
      question: "What is the primary motivation behind Mini-Batch SGD compared to pure Batch Gradient Descent?",
      options: [
        "A. Mini-Batch eliminates the need for computing activations during the forward pass",
        "B. It guarantees monotonic decrease in loss at every single step",
        "C. It reduces computational overhead per update and provides stochastic regularization that helps escape saddle points",
        "D. It removes the necessity of choosing a learning rate hyperparameter"
      ],
      correct_index: 2,
      explanation: "Mini-batch updates are much faster than processing entire datasets, and the slight gradient noise helps the optimizer avoid shallow local minima."
    },
    {
      id: 5,
      question: "What weight initialization variance does He Initialization specify for a layer with $n_{\\text{in}}$ input neurons using ReLU?",
      options: [
        "A. $\\frac{1}{n_{\\text{in}}}$",
        "B. $\\frac{2}{n_{\\text{in}}}$",
        "C. $\\frac{6}{n_{\\text{in}} + n_{\\text{out}}}$",
        "D. $\\frac{1}{2 n_{\\text{in}}}$"
      ],
      correct_index: 1,
      explanation: "Because ReLU zeros out approximately half of all activations in expectation, He initialization scales variance to $\\text{Var}(W) = \\frac{2}{n_{\\text{in}}}$ to preserve signal variance."
    }
  ]
};

export const MOCK_HUMANITIES_RESULT: StudyStudioData = {
  topic: "Social Contract Theory: Hobbes vs. Locke vs. Rousseau",
  read_time_minutes: 5,
  executive_summary:
    "Social contract theory reconceptualized political legitimacy in early modern philosophy by grounding state authority in hypothetical consent rather than divine right. Thinkers framed their theories around the 'State of Nature' to diagnose fundamental human motivations and determine why rational agents would trade raw natural liberty for civil protection.\n\nWhile Thomas Hobbes viewed absolute sovereignty as the only bulwark against violent chaos, John Locke argued for a limited fiduciary government protecting inalienable rights with an inherent right to revolution. In contrast, Jean-Jacques Rousseau attacked civil property as the origin of inequality and advocated direct popular sovereignty through the collective General Will.",
  high_yield_takeaways: [
    "Contractarian legitimacy derives authority from mutual consent rather than the historical Divine Right of Kings.",
    "Hobbes portrays the State of Nature as 'nasty, brutish, and short,' requiring irrevocable submission to an indivisible Leviathan.",
    "Locke's State of Nature contains pre-political natural rights (life, liberty, estate) bounded by moral law, which government is entrusted to protect.",
    "Lockean theory explicitly reserves the Right of Revolution when the state breaks its fiduciary trust with the citizenry.",
    "Rousseau distinguishes between the selfish 'Will of All' and the common-interest 'General Will' (Volonté Générale)."
  ],
  key_formulas_or_definitions: [
    {
      term: "State of Nature",
      definition: "A hypothetical pre-political condition without centralized civil authority, used as an analytical tool to derive legitimate political obligations."
    },
    {
      term: "Bellum Omnium Contra Omnes",
      definition: "Hobbesian formulation of 'war of all against all' describing the constant threat and insecurity inherent in the ungoverned natural state."
    },
    {
      term: "Lockean Labor Proviso",
      definition: "The moral condition that private property acquisition through labor is legitimate provided 'enough and as good' is left in common for others."
    },
    {
      term: "Fiduciary Trust",
      definition: "Locke's concept of government as a conditional trustee whose power is legally and morally contingent on upholding citizens' natural rights."
    },
    {
      term: "General Will (Volonté Générale)",
      definition: "Rousseau's collective will of the sovereign citizenry aimed exclusively at the common good, distinct from the aggregate sum of private interests."
    },
    {
      term: "Amour de Soi vs. Amour-Propre",
      definition: "Rousseau's distinction between healthy, natural self-preservation (amour de soi) and vanity-driven, competitive pride engendered by society (amour-propre)."
    }
  ],
  practice_quiz: [
    {
      id: 1,
      question: "According to John Locke, under what specific circumstance do citizens possess a legitimate moral right of revolution?",
      options: [
        "A. Whenever any individual citizen disagrees with tax legislation",
        "B. When the legislative systematically breaches its fiduciary trust by violating life, liberty, or property",
        "C. Only after receiving unanimous assent from the ecclesiastical council",
        "D. Revolution is strictly prohibited under all circumstances"
      ],
      correct_index: 1,
      explanation: "Locke defined government as a conditional trust; when governors usurp power and violate natural rights, sovereignty reverts to the people."
    },
    {
      id: 2,
      question: "How did Jean-Jacques Rousseau's appraisal of the 'State of Nature' fundamentally diverge from Thomas Hobbes?",
      options: [
        "A. Rousseau believed humans were naturally corrupted by technology in the state of nature",
        "B. Rousseau claimed natural humans were peaceful, self-sufficient, and compassionate, while Hobbes viewed them as perpetually at war",
        "C. Rousseau argued that monarchs held divine authority in the natural state",
        "D. Rousseau viewed the state of nature as a fully developed legal commonwealth"
      ],
      correct_index: 1,
      explanation: "Rousseau argued that Hobbes falsely projected modern competitive vices into natural humans, who were originally solitary and guided by natural empathy."
    },
    {
      id: 3,
      question: "What is the primary purpose of Hobbes's 'Leviathan' according to his social contract theory?",
      options: [
        "A. To enforce religious conformity across all international borders",
        "B. To eliminate all private commerce and implement state wealth redistribution",
        "C. To prevent the violent state of nature by monopolizing coercive authority and maintaining internal peace",
        "D. To prepare the citizenry for democratic direct elections"
      ],
      correct_index: 2,
      explanation: "For Hobbes, only an absolute and undivided sovereign possesses sufficient coercive power to restrain human passions and preserve mutual survival."
    },
    {
      id: 4,
      question: "In Rousseau's political philosophy, what distinguishes the 'General Will' from the 'Will of All'?",
      options: [
        "A. The General Will considers only the common public interest, while the Will of All is merely the sum of particular private interests",
        "B. The General Will is decided by the aristocracy, while the Will of All is voted on by commoners",
        "C. The Will of All applies only to economic disputes",
        "D. There is no distinction; they are interchangeable terms"
      ],
      correct_index: 0,
      explanation: "Rousseau clarifies that the General Will aims at the common welfare, whereas the Will of All simply tallies factional and selfish preferences."
    },
    {
      id: 5,
      question: "What constitutes the foundation of private property rights under John Locke's Second Treatise?",
      options: [
        "A. A royal charter or sovereign decree",
        "B. An individual mixing their own labor with natural resources, provided enough and as good remains for others",
        "C. Military conquest and territorial occupation",
        "D. Written consent from neighboring landowners"
      ],
      correct_index: 1,
      explanation: "Locke's labor theory of property states that by mixing bodily labor with unowned nature, one legitimately appropriates it as private property."
    }
  ]
};
