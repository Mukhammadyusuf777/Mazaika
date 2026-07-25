export const miniAppTemplates = [
  {
    id: "product-catalog",
    name: "Premium Product Catalog",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0f172a; color: white; }
    .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
  </style>
</head>
<body class="p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Premium Products</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="glass p-6 rounded-2xl transition hover:scale-105">
        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e" class="w-full h-48 object-cover rounded-xl mb-4" />
        <h2 class="text-2xl font-semibold mb-2">Wireless Headphones</h2>
        <p class="text-gray-400 mb-4">$299.00</p>
        <button class="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold">Add to Cart</button>
      </div>
      <div class="glass p-6 rounded-2xl transition hover:scale-105">
        <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30" class="w-full h-48 object-cover rounded-xl mb-4" />
        <h2 class="text-2xl font-semibold mb-2">Smart Watch</h2>
        <p class="text-gray-400 mb-4">$199.00</p>
        <button class="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold">Add to Cart</button>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "portfolio",
    name: "Developer Portfolio",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: linear-gradient(to bottom right, #1a202c, #2d3748); color: white; min-height: 100vh; }
    .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
  </style>
</head>
<body class="p-8 font-sans">
  <div class="max-w-3xl mx-auto glass rounded-3xl p-10 mt-10">
    <div class="flex items-center gap-8 mb-10">
      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" class="w-32 h-32 rounded-full border-4 border-blue-500 object-cover" />
      <div>
        <h1 class="text-5xl font-bold mb-2">John Doe</h1>
        <p class="text-xl text-blue-400">Senior Full-Stack Developer</p>
      </div>
    </div>
    <div class="space-y-6">
      <h2 class="text-2xl font-bold border-b border-gray-700 pb-2">Skills</h2>
      <div class="flex gap-4 flex-wrap">
        <span class="px-4 py-2 bg-blue-600 rounded-full">React</span>
        <span class="px-4 py-2 bg-green-600 rounded-full">Node.js</span>
        <span class="px-4 py-2 bg-yellow-600 rounded-full">Python</span>
      </div>
      <h2 class="text-2xl font-bold border-b border-gray-700 pb-2 mt-8">Contact</h2>
      <a href="mailto:contact@example.com" class="text-blue-400 hover:underline">contact@example.com</a>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "restaurant-menu",
    name: "Restaurant Menu",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-stone-900 text-stone-100 p-8 min-h-screen">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-5xl font-serif text-center mb-12 text-amber-500">La Casa Menu</h1>
    
    <div class="mb-12">
      <h2 class="text-3xl font-serif mb-6 border-b border-stone-700 pb-2">Main Courses</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="flex gap-4 bg-stone-800 p-4 rounded-xl">
          <img src="https://images.unsplash.com/photo-1544025162-83149be88a2f" class="w-24 h-24 rounded-lg object-cover" />
          <div>
            <h3 class="text-xl font-bold mb-1">Steak Frites</h3>
            <p class="text-stone-400 text-sm mb-2">Grilled ribeye with truffle fries</p>
            <p class="text-amber-500 font-bold">$34.00</p>
          </div>
        </div>
        <div class="flex gap-4 bg-stone-800 p-4 rounded-xl">
          <img src="https://images.unsplash.com/photo-1563379926898-05f4575a45d8" class="w-24 h-24 rounded-lg object-cover" />
          <div>
            <h3 class="text-xl font-bold mb-1">Truffle Pasta</h3>
            <p class="text-stone-400 text-sm mb-2">Handmade linguine, black truffle</p>
            <p class="text-amber-500 font-bold">$26.00</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: "business-card",
    name: "Business Card",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #000; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .glass { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); }
  </style>
</head>
<body>
  <div class="glass w-80 rounded-3xl p-8 text-center text-white">
    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2" class="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white mb-6 shadow-xl" />
    <h1 class="text-2xl font-bold mb-1">Sarah Jenkins</h1>
    <p class="text-blue-300 mb-6 font-medium">CEO & Founder</p>
    
    <div class="space-y-4">
      <a href="#" class="block w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition">📞 +1 234 567 890</a>
      <a href="#" class="block w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition">✉️ Email Me</a>
      <a href="#" class="block w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition">📍 Maps Location</a>
    </div>
  </div>
</body>
</html>`
  }
];
