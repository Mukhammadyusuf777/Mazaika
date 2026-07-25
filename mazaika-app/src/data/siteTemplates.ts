export const siteTemplates = [
  {
    id: "saas-landing",
    name: "SaaS Landing Page",
    description: "Modern landing page for software products",
    icon: "🚀",
    category: "landing",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body class="bg-gray-900 text-white min-h-screen font-sans">
  <nav class="p-6 flex justify-between items-center max-w-6xl mx-auto glass-nav">
    <div class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Nexus.</div>
    <div class="space-x-6">
      <a href="#features" class="hover:text-blue-400">Features</a>
      <a href="#pricing" class="hover:text-blue-400">Pricing</a>
      <button class="bg-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition">Get Started</button>
    </div>
  </nav>

  <main class="max-w-6xl mx-auto mt-20 text-center px-4">
    <h1 class="text-6xl font-extrabold mb-6">Build the Future with <span class="text-blue-500">Nexus</span></h1>
    <p class="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">The ultimate platform for modern teams to collaborate, build, and scale faster than ever.</p>
    <div class="flex justify-center gap-4">
      <button class="bg-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition">Start Free Trial</button>
      <button class="bg-gray-800 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-700 transition border border-gray-700">View Demo</button>
    </div>
  </main>
</body>
</html>`,
      "style.css": `
body { margin: 0; padding: 0; }
.glass-nav { background: rgba(17, 24, 39, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.1); }
`,
      "script.js": `console.log("SaaS Landing Loaded");`
    }
  },
  {
    id: "agency",
    name: "Digital Agency",
    description: "Creative agency portfolio and services",
    icon: "✨",
    category: "agency",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body class="bg-black text-white">
  <div class="min-h-screen flex flex-col justify-center px-12 relative overflow-hidden">
    <div class="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-30"></div>
    <div class="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-30"></div>
    
    <h1 class="text-8xl font-black mb-6 z-10">We create <br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">digital magic.</span></h1>
    <p class="text-2xl text-gray-400 max-w-2xl mb-12 z-10">Award-winning design and development agency based in New York.</p>
    
    <div class="z-10">
      <button class="bg-white text-black px-10 py-4 rounded-full font-bold text-xl hover:scale-105 transition transform">Our Work</button>
    </div>
  </div>
</body>
</html>`,
      "style.css": `body { font-family: 'Inter', sans-serif; }`,
      "script.js": `// Agency interactions`
    }
  },
  {
    id: "portfolio",
    name: "Developer Portfolio",
    description: "Professional portfolio site",
    icon: "👨‍💻",
    category: "portfolio",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-gray-100">
  <div class="max-w-4xl mx-auto py-20 px-6">
    <header class="flex items-center gap-8 mb-20">
      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" alt="Profile" class="w-40 h-40 rounded-full object-cover border-4 border-emerald-500 shadow-xl shadow-emerald-500/20">
      <div>
        <h1 class="text-5xl font-bold mb-4">Alex Chen</h1>
        <h2 class="text-2xl text-emerald-400">Full-Stack Engineer</h2>
      </div>
    </header>
    
    <section>
      <h3 class="text-3xl font-bold mb-8 border-b border-gray-700 pb-4">Featured Projects</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-emerald-500 transition cursor-pointer">
          <h4 class="text-xl font-bold mb-2">E-Commerce App</h4>
          <p class="text-gray-400 mb-4">Next.js, Stripe, Tailwind</p>
          <a href="#" class="text-emerald-400 hover:underline">View Source &rarr;</a>
        </div>
        <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-emerald-500 transition cursor-pointer">
          <h4 class="text-xl font-bold mb-2">AI Dashboard</h4>
          <p class="text-gray-400 mb-4">React, Python, OpenAI</p>
          <a href="#" class="text-emerald-400 hover:underline">View Source &rarr;</a>
        </div>
      </div>
    </section>
  </div>
</body>
</html>`,
      "style.css": ``,
      "script.js": ``
    }
  },
  {
    id: "startup",
    name: "Tech Startup",
    description: "Startup landing with demo and roadmap",
    icon: "📈",
    category: "landing",
    files: {
      "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900">
  <nav class="p-6 flex justify-between items-center max-w-7xl mx-auto border-b border-gray-200">
    <div class="text-2xl font-black text-indigo-600">FinTech.io</div>
    <button class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700">Download App</button>
  </nav>

  <main class="max-w-7xl mx-auto py-20 px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    <div>
      <h1 class="text-6xl font-black mb-6 leading-tight">Banking, <br/>reimagined.</h1>
      <p class="text-xl text-gray-600 mb-8">Take control of your finances with zero fees, instant transfers, and AI-powered insights.</p>
      <form class="flex gap-4">
        <input type="email" placeholder="Enter your email" class="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200">
        <button class="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition">Get Early Access</button>
      </form>
    </div>
    <div class="relative">
      <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71" class="rounded-3xl shadow-2xl" alt="App Preview">
      <div class="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
        <div class="font-bold text-gray-900 mb-1">Total Balance</div>
        <div class="text-3xl font-black text-emerald-500">$24,500.00</div>
      </div>
    </div>
  </main>
</body>
</html>`,
      "style.css": ``,
      "script.js": ``
    }
  }
];
