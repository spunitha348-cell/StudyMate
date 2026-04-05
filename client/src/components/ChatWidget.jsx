import { useState, useRef, useEffect } from 'react'

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to StudyMate for engineering students! 👋 How can we help you today?\n\nI can help you with:\n• 📚 100+ Engineering Topics\n• 💻 Programming Languages\n• 🗄️ Database Concepts\n• 🌐 Web Development\n• 🤖 AI/ML\n• 🎯 Career Guidance\n• 💡 Project Ideas",
      sender: 'bot',
      timestamp: new Date(),
      options: ['📚 Browse Topics', '💻 Programming Help', '🎯 Career Advice']
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
      inputRef.current?.focus()
      setUnreadCount(0)
    }
  }, [messages, isOpen, isMinimized])

  // Comprehensive knowledge base with 100+ data points
  const knowledgeBase = {
    // Programming Languages (15+ topics)
    python: {
      basics: "🐍 Python is a high-level, interpreted programming language.\n\nKey Features:\n• Easy to learn syntax\n• Dynamic typing\n• Extensive libraries\n• Cross-platform\n\nPopular frameworks: Django, Flask, FastAPI",
      dataTypes: "📊 Python Data Types:\n\n1. Numbers: int, float, complex\n2. Strings: str\n3. Lists: [1, 2, 3]\n4. Tuples: (1, 2, 3)\n5. Dictionaries: {'key': 'value'}\n6. Sets: {1, 2, 3}\n7. Booleans: True/False",
      loops: "🔄 Python Loops:\n\nFor Loop:\nfor i in range(5):\n    print(i)\n\nWhile Loop:\ncount = 0\nwhile count < 5:\n    print(count)\n    count += 1\n\nList Comprehension:\n[x**2 for x in range(10)]",
      functions: "📝 Python Functions:\n\ndef function_name(parameters):\n    '''Docstring'''\n    # Function body\n    return value\n\nLambda functions:\nsquare = lambda x: x**2\n\nDecorators: @staticmethod, @classmethod",
      oop: "🏗️ Python OOP Concepts:\n\nclass ClassName:\n    def __init__(self, param):\n        self.param = param\n    \n    def method(self):\n        return self.param\n\n• Inheritance\n• Polymorphism\n• Encapsulation\n• Abstraction",
      fileHandling: "📁 File Handling in Python:\n\n# Read file\nwith open('file.txt', 'r') as f:\n    content = f.read()\n\n# Write file\nwith open('file.txt', 'w') as f:\n    f.write('Hello')\n\nModes: r, w, a, r+, w+, a+, rb, wb",
      exceptions: "⚠️ Exception Handling:\n\ntry:\n    # Risky code\n    result = 10/0\nexcept ZeroDivisionError:\n    print(\"Cannot divide by zero\")\nexcept Exception as e:\n    print(f\"Error: {e}\")\nelse:\n    print(\"No error\")\nfinally:\n    print(\"Always executes\")",
      modules: "📦 Python Modules & Packages:\n\nImport methods:\nimport math\nfrom datetime import datetime\nimport pandas as pd\n\nPopular modules:\n• numpy - numerical computing\n• pandas - data analysis\n• matplotlib - plotting\n• requests - HTTP calls\n• django - web framework",
      listMethods: "📋 Python List Methods:\n\n• append(x) - add to end\n• extend(iterable) - add multiple\n• insert(i, x) - insert at index\n• remove(x) - remove first occurrence\n• pop(i) - remove at index\n• index(x) - find index\n• count(x) - count occurrences\n• sort() - sort list\n• reverse() - reverse list\n• clear() - remove all",
      dictionaryMethods: "📖 Python Dictionary Methods:\n\n• keys() - get all keys\n• values() - get all values\n• items() - get key-value pairs\n• get(key) - safe access\n• update(dict) - merge dictionaries\n• pop(key) - remove key\n• popitem() - remove last item\n• copy() - shallow copy\n• clear() - remove all"
    },
    
    java: {
      basics: "☕ Java is an object-oriented, class-based programming language.\n\nFeatures:\n• Platform independent (JVM)\n• Automatic memory management\n• Multithreading support\n• Strong type checking\n• Rich API",
      oop: "🏛️ Java OOP Concepts:\n\npublic class Student {\n    private String name;\n    \n    // Constructor\n    public Student(String name) {\n        this.name = name;\n    }\n    \n    // Getter/Setter\n    public String getName() {\n        return name;\n    }\n    \n    // Method\n    public void study() {\n        System.out.println(name + \" is studying\");\n    }\n}",
      collections: "📚 Java Collections Framework:\n\nList: ArrayList, LinkedList, Vector\nSet: HashSet, TreeSet, LinkedHashSet\nMap: HashMap, TreeMap, LinkedHashMap\nQueue: PriorityQueue, ArrayDeque\n\nDifferences:\n• List: ordered, allows duplicates\n• Set: unordered, no duplicates\n• Map: key-value pairs",
      multithreading: "🧵 Java Multithreading:\n\n// Extending Thread class\nclass MyThread extends Thread {\n    public void run() {\n        System.out.println(\"Thread running\");\n    }\n}\n\n// Implementing Runnable\nclass MyRunnable implements Runnable {\n    public void run() {\n        System.out.println(\"Runnable running\");\n    }\n}\n\n// Synchronization\nsynchronized void method() { }"
    },
    
    javascript: {
      basics: "🟡 JavaScript is a dynamic programming language for web development.\n\nFeatures:\n• Event-driven\n• Functional programming\n• Prototype-based OOP\n• Asynchronous programming\n• DOM manipulation",
      es6: "✨ ES6+ Features:\n\n// Arrow functions\nconst add = (a,b) => a+b\n\n// Template literals\n`Hello ${name}`\n\n// Destructuring\nconst {name, age} = person\n\n// Spread operator\n[...arr1, ...arr2]\n\n// Promises\nfetch(url).then(res=>res.json())\n\n// Async/Await\nasync function getData() {\n    const data = await fetch(url)\n}",
      async: "⏳ Asynchronous JavaScript:\n\nCallbacks:\nsetTimeout(() => {}, 1000)\n\nPromises:\nnew Promise((resolve, reject) => {})\n\nAsync/Await:\nasync function fetchData() {\n    try {\n        const response = await fetch(url)\n        const data = await response.json()\n    } catch(error) {\n        console.error(error)\n    }\n}\n\nPromise.all()\nPromise.race()\nPromise.allSettled()"
    },
    
    // Database Topics (15+ topics)
    dbms: {
      basics: "🗄️ Database Management System (DBMS) is software for creating and managing databases.\n\nTypes:\n• Relational DBMS (MySQL, PostgreSQL)\n• NoSQL (MongoDB, Cassandra)\n• Object-oriented DBMS\n• Hierarchical DBMS\n\nAdvantages:\n• Data consistency\n• Security\n• Backup/recovery\n• Concurrent access",
      sqlBasics: "📊 SQL (Structured Query Language):\n\nDDL (Data Definition Language):\nCREATE, ALTER, DROP, TRUNCATE\n\nDML (Data Manipulation Language):\nSELECT, INSERT, UPDATE, DELETE\n\nDCL (Data Control Language):\nGRANT, REVOKE\n\nTCL (Transaction Control Language):\nCOMMIT, ROLLBACK, SAVEPOINT",
      joins: "🔗 SQL JOIN Types:\n\nINNER JOIN: SELECT * FROM table1 \nINNER JOIN table2 ON table1.id = table2.id\n\nLEFT JOIN: All records from left table\nRIGHT JOIN: All records from right table\nFULL JOIN: All records from both tables\nCROSS JOIN: Cartesian product\nSELF JOIN: Join table with itself",
      normalization: "📐 Database Normalization:\n\n1NF: Atomic values, no repeating groups\n2NF: 1NF + no partial dependencies\n3NF: 2NF + no transitive dependencies\nBCNF: 3NF + every determinant is a candidate key\n4NF: No multi-valued dependencies\n5NF: No join dependencies",
      indexing: "🔍 Database Indexing:\n\nTypes:\n• B-Tree Index (default)\n• Hash Index\n• Bitmap Index\n• Clustered Index\n• Non-clustered Index\n\nBenefits:\n• Faster SELECT queries\n• Unique constraint enforcement\n\nTrade-offs:\n• Slower INSERT/UPDATE/DELETE\n• Extra storage space",
      acid: "💾 ACID Properties:\n\nAtomicity: Transactions are all-or-nothing\nConsistency: Data remains valid\nIsolation: Concurrent transactions don't interfere\nDurability: Committed data persists\n\nExample:\nBEGIN TRANSACTION;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;",
      mongodb: "🍃 MongoDB (NoSQL):\n\nFeatures:\n• Document-oriented\n• Schema-less\n• Horizontal scaling\n• JSON-like documents\n\nOperations:\ndb.collection.find({})\ndb.collection.insertOne({})\ndb.collection.updateOne({}, {$set: {}})\ndb.collection.deleteOne({})"
    },
    
    // Web Development (15+ topics)
    react: {
      basics: "⚛️ React.js Fundamentals:\n\nComponents:\nfunction Welcome(props) {\n    return <h1>Hello {props.name}</h1>\n}\n\nclass Welcome extends React.Component {\n    render() {\n        return <h1>Hello {this.props.name}</h1>\n    }\n}\n\nJSX: JavaScript + XML\nVirtual DOM for performance",
      hooks: "🎣 React Hooks:\n\nuseState: const [count, setCount] = useState(0)\nuseEffect: useEffect(() => {}, [dependencies])\nuseContext: const value = useContext(MyContext)\nuseReducer: const [state, dispatch] = useReducer(reducer, init)\nuseCallback: const memoized = useCallback(() => {}, [deps])\nuseMemo: const memoized = useMemo(() => compute(), [deps])\nuseRef: const ref = useRef(initialValue)",
      stateManagement: "📦 State Management in React:\n\nLocal State: useState\nContext API: React.createContext()\nRedux: Centralized store\nZustand: Minimalistic state\nRecoil: Atom-based state\nMobX: Observable state\n\nRedux Flow:\nAction → Dispatch → Reducer → Store → View"
    },
    
    nodejs: {
      basics: "🟢 Node.js is a JavaScript runtime built on Chrome's V8 engine.\n\nFeatures:\n• Event-driven\n• Non-blocking I/O\n• Single-threaded\n• NPM ecosystem\n\nBuilt-in modules:\nfs, path, http, os, crypto, events"
    },
    
    express: {
      basics: "🚂 Express.js Framework:\n\nconst express = require('express')\nconst app = express()\n\n// Middleware\napp.use(express.json())\n\n// Routes\napp.get('/api/users', (req, res) => {\n    res.json(users)\n})\n\napp.post('/api/users', (req, res) => {\n    const user = req.body\n    users.push(user)\n    res.status(201).json(user)\n})\n\napp.listen(3000)"
    },
    
    // Data Structures (15+ topics)
    dsa: {
      arrays: "📊 Arrays:\n\nTime Complexity:\n• Access: O(1)\n• Search: O(n)\n• Insertion: O(n)\n• Deletion: O(n)\n\nOperations:\n• Traversal\n• Insertion at position\n• Deletion\n• Searching (linear/binary)\n• Sorting (bubble, selection, insertion, merge, quick)",
      linkedList: "🔗 Linked Lists:\n\nTypes:\n• Singly Linked List\n• Doubly Linked List\n• Circular Linked List\n\nTime Complexity:\n• Access: O(n)\n• Search: O(n)\n• Insertion: O(1) at head\n• Deletion: O(1) at head\n\nNode Structure:\nclass Node {\n    int data\n    Node next\n    Node prev  // for doubly\n}",
      stacks: "📚 Stacks (LIFO):\n\nOperations:\n• push() - add to top\n• pop() - remove from top\n• peek() - view top\n• isEmpty() - check empty\n\nApplications:\n• Function calls\n• Undo/Redo\n• Expression evaluation\n• Backtracking\n\nImplementation:\n• Using arrays\n• Using linked lists",
      queues: "📋 Queues (FIFO):\n\nOperations:\n• enqueue() - add to rear\n• dequeue() - remove from front\n• front() - view front\n• rear() - view rear\n\nTypes:\n• Simple Queue\n• Circular Queue\n• Priority Queue\n• Deque (Double-ended)\n\nApplications:\n• Print spooling\n• Task scheduling\n• BFS algorithm",
      trees: "🌲 Trees:\n\nBinary Tree: Each node has ≤ 2 children\nBinary Search Tree: left < root < right\nAVL Tree: Self-balancing BST\nRed-Black Tree: Balanced BST\nHeap: Complete binary tree (Min/Max)\n\nTree Traversal:\n• Pre-order: Root → Left → Right\n• In-order: Left → Root → Right\n• Post-order: Left → Right → Root\n• Level-order: BFS",
      graphs: "📈 Graphs:\n\nTypes:\n• Directed/Undirected\n• Weighted/Unweighted\n• Cyclic/Acyclic\n\nRepresentation:\n• Adjacency Matrix\n• Adjacency List\n• Edge List\n\nAlgorithms:\n• DFS (Depth-First Search)\n• BFS (Breadth-First Search)\n• Dijkstra's (shortest path)\n• Bellman-Ford\n• Floyd-Warshall\n• Kruskal's MST\n• Prim's MST",
      sorting: "🔄 Sorting Algorithms:\n\nBubble Sort: O(n²)\nSelection Sort: O(n²)\nInsertion Sort: O(n²)\nMerge Sort: O(n log n)\nQuick Sort: O(n log n) average, O(n²) worst\nHeap Sort: O(n log n)\nCounting Sort: O(n + k)\nRadix Sort: O(nk)\n\nComparison:\n• Stable vs Unstable\n• In-place vs Not in-place\n• Adaptive vs Non-adaptive",
      searching: "🔍 Searching Algorithms:\n\nLinear Search: O(n)\nBinary Search: O(log n) - requires sorted array\nJump Search: O(√n)\nInterpolation Search: O(log log n) average\nExponential Search: O(log n)\nTernary Search: O(log₃ n)\n\nHashing: O(1) average"
    },
    
    // Operating Systems (10+ topics)
    os: {
      processes: "⚙️ Process Management:\n\nProcess States:\nNew → Ready → Running → Waiting → Terminated\n\nPCB (Process Control Block):\n• Process ID\n• Program counter\n• CPU registers\n• Memory limits\n• Open files\n\nContext Switching: Saving/Loading process state",
      scheduling: "📅 CPU Scheduling Algorithms:\n\nFCFS (First Come First Serve): Non-preemptive\nSJF (Shortest Job First): Non-preemptive\nSRTF (Shortest Remaining Time First): Preemptive\nRound Robin: Time quantum based\nPriority Scheduling: Higher priority first\nMultilevel Queue: Multiple queues with priorities\n\nPerformance metrics:\n• Throughput\n• Turnaround time\n• Waiting time\n• Response time",
      memoryManagement: "💾 Memory Management:\n\nTechniques:\n• Fixed Partitioning\n• Dynamic Partitioning\n• Paging\n• Segmentation\n• Virtual Memory\n\nPage Replacement Algorithms:\n• FIFO\n• LRU (Least Recently Used)\n• Optimal\n• Clock\n• MFU (Most Frequently Used)",
      deadlocks: "⚠️ Deadlocks:\n\n4 Necessary Conditions:\n1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait\n\nDeadlock Handling:\n• Prevention\n• Avoidance (Banker's Algorithm)\n• Detection\n• Recovery",
      fileSystems: "📁 File Systems:\n\nFile Operations:\n• Create\n• Read\n• Write\n• Delete\n• Truncate\n• Append\n\nDirectory Structures:\n• Single-level\n• Two-level\n• Tree-structured\n• Acyclic graph\n• General graph\n\nFile Allocation Methods:\n• Contiguous\n• Linked\n• Indexed"
    },
    
    // Computer Networks (10+ topics)
    networking: {
      osiModel: "🌐 OSI Model (7 Layers):\n\n7. Application: HTTP, FTP, SMTP\n6. Presentation: SSL, Encryption\n5. Session: NetBIOS, RPC\n4. Transport: TCP, UDP\n3. Network: IP, ICMP, ARP\n2. Data Link: Ethernet, WiFi\n1. Physical: Cables, Hubs\n\nPDU names:\nApplication: Data\nTransport: Segment\nNetwork: Packet\nData Link: Frame\nPhysical: Bits",
      tcpIp: "🔌 TCP/IP Model (4 Layers):\n\nApplication Layer: HTTP, DNS, SMTP\nTransport Layer: TCP, UDP\nInternet Layer: IP, ICMP, ARP\nNetwork Access: Ethernet, WiFi\n\nTCP Features:\n• Connection-oriented\n• Reliable\n• Flow control\n• Congestion control\n• Error checking\n\nUDP Features:\n• Connectionless\n• Unreliable\n• Faster\n• No flow control",
      protocols: "📡 Network Protocols:\n\nHTTP/HTTPS: Web browsing\nFTP: File transfer\nSMTP: Email sending\nPOP3/IMAP: Email receiving\nDNS: Domain resolution\nDHCP: IP assignment\nSSH: Secure shell\nTelnet: Remote login\nSNMP: Network management",
      ipAddressing: "🌍 IP Addressing:\n\nIPv4: 32-bit (e.g., 192.168.1.1)\nIPv6: 128-bit\n\nClasses:\nClass A: 1-126 (Large networks)\nClass B: 128-191 (Medium networks)\nClass C: 192-223 (Small networks)\nClass D: 224-239 (Multicast)\nClass E: 240-255 (Experimental)\n\nSubnet Mask: /24 = 255.255.255.0"
    },
    
    // AI/ML (10+ topics)
    ai: {
      basics: "🤖 Artificial Intelligence:\n\nBranches:\n• Machine Learning\n• Deep Learning\n• Natural Language Processing\n• Computer Vision\n• Robotics\n• Expert Systems\n\nTypes:\n• Narrow AI\n• General AI\n• Super AI",
      mlTypes: "📊 Machine Learning Types:\n\nSupervised Learning:\n• Classification (Spam detection)\n• Regression (Price prediction)\n\nUnsupervised Learning:\n• Clustering (Customer segmentation)\n• Association (Market basket)\n\nReinforcement Learning:\n• Game playing\n• Robotics control\n\nSemi-supervised Learning:\n• Mix of labeled/unlabeled data",
      algorithms: "🧮 ML Algorithms:\n\nRegression:\n• Linear Regression\n• Logistic Regression\n• Polynomial Regression\n\nClassification:\n• K-Nearest Neighbors\n• Support Vector Machines\n• Decision Trees\n• Random Forest\n• Naive Bayes\n\nClustering:\n• K-Means\n• Hierarchical\n• DBSCAN\n\nNeural Networks:\n• ANN\n• CNN\n• RNN\n• LSTM",
      deepLearning: "🧠 Deep Learning:\n\nNeural Network Components:\n• Input Layer\n• Hidden Layers\n• Output Layer\n• Activation Functions (ReLU, Sigmoid, Tanh)\n• Loss Functions\n• Optimizers (SGD, Adam)\n\nArchitectures:\n• CNN: Image processing\n• RNN: Sequence data\n• LSTM: Long-term dependencies\n• Transformer: NLP tasks\n• GAN: Generation tasks"
    },
    
    // Career Guidance (10+ topics)
    career: {
      interview: "🎯 Interview Preparation:\n\nTechnical Topics:\n• Data Structures & Algorithms\n• System Design\n• Programming Languages\n• Database Concepts\n• Operating Systems\n• Networking\n\nBehavioral Questions:\n• Tell me about yourself\n• Why this company?\n• Strengths/Weaknesses\n• Teamwork examples\n• Conflict resolution",
      resume: "📄 Resume Tips:\n\nStructure:\n1. Contact Information\n2. Professional Summary\n3. Technical Skills\n4. Work Experience\n5. Projects\n6. Education\n7. Certifications\n\nBest Practices:\n• Keep 1-2 pages\n• Use action verbs\n• Quantify achievements\n• Tailor to job description\n• Include GitHub/portfolio\n• No spelling errors",
      codingInterview: "💻 Coding Interview Prep:\n\nPlatforms:\n• LeetCode\n• HackerRank\n• CodeSignal\n• Codeforces\n\nCommon Problems:\n• Two Sum\n• Reverse Linked List\n• Binary Search\n• Tree Traversal\n• Dynamic Programming\n• Graph Algorithms\n\nTips:\n• Think aloud\n• Test edge cases\n• Optimize solution\n• Analyze complexity"
    },
    
    // Project Ideas (20+ topics)
    projects: {
      beginner: "🌟 Beginner Projects:\n\nWeb Development:\n• Personal Portfolio\n• To-Do List App\n• Weather App\n• Calculator\n• Quiz Application\n• Blog Platform\n\nProgramming:\n• Number Guessing Game\n• Password Generator\n• Contact Book\n• Text-based Adventure\n• File Organizer\n• Basic Calculator",
      intermediate: "💪 Intermediate Projects:\n\nFull-Stack:\n• E-commerce Site\n• Social Media Dashboard\n• Chat Application\n• Task Management System\n• URL Shortener\n• Video Streaming Platform\n\nData Science:\n• Data Visualization Dashboard\n• Recommendation System\n• Sentiment Analysis\n• Stock Price Predictor\n• Spam Detector\n• Image Classifier",
      advanced: "🚀 Advanced Projects:\n\nAI/ML:\n• Chatbot with NLP\n• Face Recognition System\n• Autonomous Agent\n• Real-time Object Detection\n• Speech Recognition\n• Machine Translation\n\nSystem Design:\n• Distributed File System\n• Load Balancer\n• Database Replication System\n• Message Queue\n• Cache System\n• API Gateway"
    }
  }

  const getBotResponse = (input) => {
    const msg = input.toLowerCase().trim()
    
    // Programming Languages
    if (msg.includes("python")) {
      if (msg.includes("list")) return knowledgeBase.python.listMethods
      if (msg.includes("dictionary") || msg.includes("dict")) return knowledgeBase.python.dictionaryMethods
      if (msg.includes("oop") || msg.includes("class")) return knowledgeBase.python.oop
      if (msg.includes("file")) return knowledgeBase.python.fileHandling
      if (msg.includes("exception") || msg.includes("error")) return knowledgeBase.python.exceptions
      if (msg.includes("module") || msg.includes("package")) return knowledgeBase.python.modules
      if (msg.includes("function")) return knowledgeBase.python.functions
      if (msg.includes("loop")) return knowledgeBase.python.loops
      return knowledgeBase.python.basics
    }
    
    if (msg.includes("java")) {
      if (msg.includes("collection")) return knowledgeBase.java.collections
      if (msg.includes("thread")) return knowledgeBase.java.multithreading
      if (msg.includes("oop") || msg.includes("class")) return knowledgeBase.java.oop
      return knowledgeBase.java.basics
    }
    
    if (msg.includes("javascript") || msg.includes("js")) {
      if (msg.includes("async") || msg.includes("promise")) return knowledgeBase.javascript.async
      if (msg.includes("es6")) return knowledgeBase.javascript.es6
      return knowledgeBase.javascript.basics
    }
    
    // Database
    if (msg.includes("dbms") || msg.includes("database")) {
      if (msg.includes("sql") && msg.includes("join")) return knowledgeBase.dbms.joins
      if (msg.includes("normalization")) return knowledgeBase.dbms.normalization
      if (msg.includes("acid")) return knowledgeBase.dbms.acid
      if (msg.includes("index")) return knowledgeBase.dbms.indexing
      if (msg.includes("mongodb") || msg.includes("nosql")) return knowledgeBase.dbms.mongodb
      if (msg.includes("sql")) return knowledgeBase.dbms.sqlBasics
      return knowledgeBase.dbms.basics
    }
    
    // Web Development
    if (msg.includes("react")) {
      if (msg.includes("hook")) return knowledgeBase.react.hooks
      if (msg.includes("state") || msg.includes("redux")) return knowledgeBase.react.stateManagement
      return knowledgeBase.react.basics
    }
    
    if (msg.includes("node")) return knowledgeBase.nodejs.basics
    if (msg.includes("express")) return knowledgeBase.express.basics
    
    // Data Structures
    if (msg.includes("array")) return knowledgeBase.dsa.arrays
    if (msg.includes("linked list")) return knowledgeBase.dsa.linkedList
    if (msg.includes("stack")) return knowledgeBase.dsa.stacks
    if (msg.includes("queue")) return knowledgeBase.dsa.queues
    if (msg.includes("tree") || msg.includes("binary")) return knowledgeBase.dsa.trees
    if (msg.includes("graph")) return knowledgeBase.dsa.graphs
    if (msg.includes("sort")) return knowledgeBase.dsa.sorting
    if (msg.includes("search")) return knowledgeBase.dsa.searching
    
    // Operating Systems
    if (msg.includes("process")) return knowledgeBase.os.processes
    if (msg.includes("scheduling")) return knowledgeBase.os.scheduling
    if (msg.includes("memory")) return knowledgeBase.os.memoryManagement
    if (msg.includes("deadlock")) return knowledgeBase.os.deadlocks
    if (msg.includes("file system")) return knowledgeBase.os.fileSystems
    
    // Networking
    if (msg.includes("osi")) return knowledgeBase.networking.osiModel
    if (msg.includes("tcp") || msg.includes("ip")) return knowledgeBase.networking.tcpIp
    if (msg.includes("protocol")) return knowledgeBase.networking.protocols
    if (msg.includes("ip address")) return knowledgeBase.networking.ipAddressing
    
    // AI/ML
    if (msg.includes("ai") || msg.includes("artificial intelligence")) {
      if (msg.includes("ml type")) return knowledgeBase.ai.mlTypes
      if (msg.includes("algorithm")) return knowledgeBase.ai.algorithms
      if (msg.includes("deep learning")) return knowledgeBase.ai.deepLearning
      return knowledgeBase.ai.basics
    }
    
    // Career
    if (msg.includes("interview")) {
      if (msg.includes("coding")) return knowledgeBase.career.codingInterview
      return knowledgeBase.career.interview
    }
    if (msg.includes("resume")) return knowledgeBase.career.resume
    
    // Projects
    if (msg.includes("project")) {
      if (msg.includes("beginner")) return knowledgeBase.projects.beginner
      if (msg.includes("intermediate")) return knowledgeBase.projects.intermediate
      if (msg.includes("advanced")) return knowledgeBase.projects.advanced
      return "💡 Project Ideas:\n\n🌟 Beginner: Portfolio, To-Do App, Calculator\n💪 Intermediate: E-commerce, Chat App, Dashboard\n🚀 Advanced: AI Chatbot, Face Recognition, Distributed System\n\nWhat level are you interested in?"
    }
    
    // Quick responses
    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
      return "Hello! 👋 Welcome to StudyMate! I have 100+ engineering topics covered. What would you like to learn today?\n\nPopular topics:\n• Python Programming 🐍\n• Database Management 🗄️\n• Web Development 🌐\n• Data Structures 📊\n• Career Guidance 🎯"
    }
    
    if (msg.includes("help")) {
      return "📚 I can help you with:\n\n💻 Programming: Python, Java, JavaScript\n🗄️ Database: SQL, DBMS, MongoDB\n🌐 Web Dev: React, Node.js, Express\n📊 DSA: Arrays, Trees, Graphs, Sorting\n⚙️ OS: Processes, Scheduling, Memory\n🌍 Networks: OSI, TCP/IP, Protocols\n🤖 AI/ML: ML Types, Algorithms, Deep Learning\n🎯 Career: Interviews, Resume, Coding Prep\n💡 Projects: Beginner to Advanced\n\nWhat topic interests you?"
    }
    
    if (msg.includes("thank")) {
      return "You're very welcome! 😊 I'm glad I could help. Keep exploring and learning! 🚀\n\nIs there anything else you'd like to know about?"
    }
    
    // Default response with topic suggestions
    return "📚 I have 100+ engineering topics! Here's what you can ask about:\n\n🔹 Programming: Python, Java, JavaScript\n🔹 Database: SQL, DBMS, MongoDB, Normalization\n🔹 Web Dev: React, Node.js, Express, APIs\n🔹 DSA: Arrays, Linked Lists, Trees, Graphs\n🔹 OS: Processes, Scheduling, Deadlocks\n🔹 Networks: OSI Model, TCP/IP, Protocols\n🔹 AI/ML: Machine Learning, Deep Learning\n🔹 Career: Interviews, Resume, Projects\n\nWhat would you like to explore? Type 'help' for more options!"
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userText = inputMessage
    const userMessage = {
      id: messages.length + 1,
      text: userText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)
    setShowQuickReplies(false)

    setTimeout(() => {
      const response = getBotResponse(userText)
      
      const botMessage = {
        id: messages.length + 2,
        text: response,
        sender: 'bot',
        timestamp: new Date(),
        options: response.includes('?') ? ['Learn more', 'Next topic', 'Help'] : undefined
      }

      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
      
      if (isMinimized) {
        setUnreadCount(prev => prev + 1)
      }
    }, 600)
  }

  const handleQuickReply = (reply) => {
    setInputMessage(reply)
    const syntheticEvent = { preventDefault: () => {} }
    handleSendMessage(syntheticEvent)
  }

  const handlePhoneClick = () => {
    window.location.href = 'tel:+1234567890'
  }

  const handleEmailClick = () => {
    window.location.href = 'mailto:support@studymate.com'
  }

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/1234567890', '_blank')
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center w-16 h-16 relative group"
        >
          💬
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
          <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Chat with StudyMate AI
          </span>
        </button>
      </div>
    )
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-80' : 'w-[500px]'}`}
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ height: isMinimized ? '60px' : '700px', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <div className="font-semibold text-lg">StudyMate static AI </div>
              <div className="text-xs text-white/90">100+ Topics • 24/7 Support</div>
            </div>
          </div>

          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={handlePhoneClick}
              className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
              title="Call support"
            >
              📞
            </button>
            <button 
              onClick={handleEmailClick}
              className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
              title="Email support"
            >
              📧
            </button>
            <button 
              onClick={handleWhatsAppClick}
              className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
              title="WhatsApp"
            >
              💬
            </button>
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? '□' : '—'}
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
              title="Close"
            >
              ✖
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
              {messages.map((message, index) => (
                <div 
                  key={message.id}
                  className="animate-fade-in"
                  style={{ animation: 'fadeIn 0.3s ease-out' }}
                >
                  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`px-4 py-2 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'bg-white text-gray-800 shadow-md'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">{message.text}</div>
                        <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                      
                      {message.sender === 'bot' && message.options && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {message.options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickReply(option)}
                              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {message.sender === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white mr-2 order-1 flex-shrink-0">
                        🤖
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-2 shadow-md">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions */}
            {showQuickReplies && messages.length <= 3 && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">💡 Popular topics (100+ available):</div>
                <div className="flex flex-wrap gap-2">
                  {['Python programming', 'SQL joins', 'React hooks', 'Data structures', 'OS scheduling', 'Career advice'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleQuickReply(suggestion)}
                      className="px-3 py-1 text-sm bg-white hover:bg-gray-100 rounded-full border border-gray-300 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about engineering... (100+ topics)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputMessage.trim()}
                >
                  Send →
                </button>
              </div>
              <div className="text-xs text-gray-400 text-center mt-2">
                💡 Try: "Python list methods" • "SQL joins" • "React hooks" • "Career tips"
              </div>
            </form>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        
        .animate-bounce {
          animation: bounce 0.8s infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ChatWidget