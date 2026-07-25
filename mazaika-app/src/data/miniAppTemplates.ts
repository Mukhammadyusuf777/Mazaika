export const miniAppTemplates = [
  {
    id: "product-catalog",
    name: "Premium Product Catalog",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    body { background-color: #0f172a; color: white; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
    .btn { min-height: 48px; padding: 12px; }
  </style>
</head>
<body class="p-4 md:p-8">
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Katalog</h1>
      <div class="relative">
        <span id="cart-badge" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hidden">0</span>
        <button class="glass p-3 rounded-xl btn" onclick="toggleCart()">🛒 Savat</button>
      </div>
    </div>
    
    <div class="flex gap-2 overflow-x-auto pb-4 mb-4" id="categories">
      <button class="px-4 py-2 rounded-full bg-blue-600 font-medium whitespace-nowrap">Elektronika</button>
      <button class="px-4 py-2 rounded-full glass font-medium whitespace-nowrap">Kiyim</button>
      <button class="px-4 py-2 rounded-full glass font-medium whitespace-nowrap">Oziq-ovqat</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="products">
      <div class="glass p-4 rounded-2xl transition hover:bg-white/10">
        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e" class="w-full h-40 object-cover rounded-xl mb-3" />
        <h2 class="text-xl font-semibold mb-1">Quloqchinlar</h2>
        <p class="text-gray-400 mb-3 font-medium">350 000 UZS</p>
        <button class="w-full bg-blue-600 hover:bg-blue-700 rounded-xl font-bold btn transition-colors" onclick="addToCart('Quloqchinlar', 350000)">Savatga qo'shish</button>
      </div>
      <div class="glass p-4 rounded-2xl transition hover:bg-white/10">
        <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30" class="w-full h-40 object-cover rounded-xl mb-3" />
        <h2 class="text-xl font-semibold mb-1">Aqlli soat</h2>
        <p class="text-gray-400 mb-3 font-medium">420 000 UZS</p>
        <button class="w-full bg-blue-600 hover:bg-blue-700 rounded-xl font-bold btn transition-colors" onclick="addToCart('Aqlli soat', 420000)">Savatga qo'shish</button>
      </div>
      <div class="glass p-4 rounded-2xl transition hover:bg-white/10">
        <img src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db" class="w-full h-40 object-cover rounded-xl mb-3" />
        <h2 class="text-xl font-semibold mb-1">PlayStation 5</h2>
        <p class="text-gray-400 mb-3 font-medium">6 500 000 UZS</p>
        <button class="w-full bg-blue-600 hover:bg-blue-700 rounded-xl font-bold btn transition-colors" onclick="addToCart('PlayStation 5', 6500000)">Savatga qo'shish</button>
      </div>
      <div class="glass p-4 rounded-2xl transition hover:bg-white/10">
        <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90" class="w-full h-40 object-cover rounded-xl mb-3" />
        <h2 class="text-xl font-semibold mb-1">Virtual ko'zoynak</h2>
        <p class="text-gray-400 mb-3 font-medium">3 200 000 UZS</p>
        <button class="w-full bg-blue-600 hover:bg-blue-700 rounded-xl font-bold btn transition-colors" onclick="addToCart('Virtual ko\\'zoynak', 3200000)">Savatga qo'shish</button>
      </div>
      <div class="glass p-4 rounded-2xl transition hover:bg-white/10">
        <img src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5" class="w-full h-40 object-cover rounded-xl mb-3" />
        <h2 class="text-xl font-semibold mb-1">Mexanik klaviatura</h2>
        <p class="text-gray-400 mb-3 font-medium">850 000 UZS</p>
        <button class="w-full bg-blue-600 hover:bg-blue-700 rounded-xl font-bold btn transition-colors" onclick="addToCart('Mexanik klaviatura', 850000)">Savatga qo'shish</button>
      </div>
      <div class="glass p-4 rounded-2xl transition hover:bg-white/10">
        <img src="https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc" class="w-full h-40 object-cover rounded-xl mb-3" />
        <h2 class="text-xl font-semibold mb-1">Simsiz sichqoncha</h2>
        <p class="text-gray-400 mb-3 font-medium">250 000 UZS</p>
        <button class="w-full bg-blue-600 hover:bg-blue-700 rounded-xl font-bold btn transition-colors" onclick="addToCart('Simsiz sichqoncha', 250000)">Savatga qo'shish</button>
      </div>
    </div>
  </div>

  <script>
    let cart = [];
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.expand();
      tg.MainButton.setText('Buyurtma berish');
      tg.MainButton.onClick(() => {
        tg.sendData(JSON.stringify({ action: 'checkout', cart, total: cart.reduce((a, b) => a + b.price, 0) }));
      });
    }

    function addToCart(name, price) {
      cart.push({ name, price });
      const badge = document.getElementById('cart-badge');
      badge.textContent = cart.length;
      badge.classList.remove('hidden');
      if (tg && cart.length > 0) {
        const total = cart.reduce((a, b) => a + b.price, 0);
        tg.MainButton.setText(\`Buyurtma berish (\${total.toLocaleString()} UZS)\`);
        tg.MainButton.show();
      }
    }

    function toggleCart() {
      // Toggle logic or show modal (simplified for template)
      alert("Savatda " + cart.length + " ta mahsulot bor.");
    }
  </script>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    body { background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); color: white; min-height: 100vh; margin: 0; font-family: sans-serif; scroll-behavior: smooth; }
    .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); }
    .btn { min-height: 48px; padding: 12px; }
  </style>
</head>
<body class="p-4 md:p-8">
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="glass rounded-3xl p-6 md:p-10 text-center relative overflow-hidden">
      <div class="absolute -top-24 -right-24 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" class="w-32 h-32 mx-auto rounded-full border-4 border-blue-400 object-cover shadow-2xl mb-4 relative z-10" />
      <h1 class="text-3xl md:text-5xl font-bold mb-2 relative z-10">Aziz Rahimov</h1>
      <p class="text-lg md:text-xl text-blue-300 font-medium relative z-10">Senior Full-Stack Dasturchi</p>
    </div>

    <div class="glass rounded-3xl p-6 md:p-8">
      <h2 class="text-2xl font-bold mb-4">Ko'nikmalar</h2>
      <div class="space-y-4">
        <div>
          <div class="flex justify-between mb-1"><span class="font-medium">React & Next.js</span><span>90%</span></div>
          <div class="w-full bg-gray-700 rounded-full h-2"><div class="bg-blue-500 h-2 rounded-full" style="width: 90%"></div></div>
        </div>
        <div>
          <div class="flex justify-between mb-1"><span class="font-medium">Node.js & NestJS</span><span>85%</span></div>
          <div class="w-full bg-gray-700 rounded-full h-2"><div class="bg-green-500 h-2 rounded-full" style="width: 85%"></div></div>
        </div>
        <div>
          <div class="flex justify-between mb-1"><span class="font-medium">TypeScript</span><span>95%</span></div>
          <div class="w-full bg-gray-700 rounded-full h-2"><div class="bg-yellow-500 h-2 rounded-full" style="width: 95%"></div></div>
        </div>
      </div>
    </div>

    <div class="glass rounded-3xl p-6 md:p-8">
      <h2 class="text-2xl font-bold mb-4">Loyihalar</h2>
      <div class="space-y-4">
        <a href="https://github.com" class="block group">
          <div class="relative rounded-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085" class="w-full h-48 object-cover transition duration-300 group-hover:scale-105" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
              <h3 class="text-xl font-bold text-white">E-commerce Platforma</h3>
              <p class="text-gray-300 text-sm">Next.js & Stripe</p>
            </div>
          </div>
        </a>
        <a href="https://github.com" class="block group">
          <div class="relative rounded-2xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71" class="w-full h-48 object-cover transition duration-300 group-hover:scale-105" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
              <h3 class="text-xl font-bold text-white">Data Analytics Dashboard</h3>
              <p class="text-gray-300 text-sm">React & D3.js</p>
            </div>
          </div>
        </a>
      </div>
    </div>

    <div class="glass rounded-3xl p-6 md:p-8 text-center">
      <h2 class="text-2xl font-bold mb-4">Aloqa</h2>
      <a href="mailto:aziz@example.com" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl btn px-8 transition">Bog'lanish</a>
    </div>
  </div>
  <script>
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.expand();
    }
  </script>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    body { background-color: #1c1917; color: #f5f5f4; margin: 0; padding-bottom: 80px; font-family: system-ui, -apple-system, sans-serif; }
    .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); }
    .btn { min-height: 48px; }
    /* Hide scrollbar for category row */
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="p-4">
  <div class="max-w-xl mx-auto relative">
    <h1 class="text-3xl font-serif text-center mb-6 text-amber-500 font-bold">Milliy Taomlar</h1>
    
    <div class="flex gap-3 overflow-x-auto no-scrollbar mb-6 sticky top-0 bg-[#1c1917] py-2 z-10">
      <button class="px-5 py-2 rounded-xl bg-amber-600 font-bold whitespace-nowrap btn">Asosiy</button>
      <button class="px-5 py-2 rounded-xl glass font-medium whitespace-nowrap btn">Quyuq taomlar</button>
      <button class="px-5 py-2 rounded-xl glass font-medium whitespace-nowrap btn">Ichimliklar</button>
      <button class="px-5 py-2 rounded-xl glass font-medium whitespace-nowrap btn">Shirinliklar</button>
    </div>
    
    <div class="space-y-4">
      <div class="flex gap-4 glass p-3 rounded-2xl">
        <img src="https://images.unsplash.com/photo-1544025162-83149be88a2f" class="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover" />
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-bold">Maxsus Osh</h3>
            <p class="text-stone-400 text-sm leading-tight mt-1">Qo'y go'shti, kazy va bedana tuxumi bilan</p>
          </div>
          <div class="flex justify-between items-center mt-2">
            <p class="text-amber-500 font-bold">45 000 UZS</p>
            <button class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-bold" onclick="add('Maxsus Osh', 45000)">+</button>
          </div>
        </div>
      </div>

      <div class="flex gap-4 glass p-3 rounded-2xl">
        <img src="https://images.unsplash.com/photo-1563379926898-05f4575a45d8" class="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover" />
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-bold">Qozonkabob</h3>
            <p class="text-stone-400 text-sm leading-tight mt-1">Yangi so'yilgan qo'y go'shtidan</p>
          </div>
          <div class="flex justify-between items-center mt-2">
            <p class="text-amber-500 font-bold">60 000 UZS</p>
            <button class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-bold" onclick="add('Qozonkabob', 60000)">+</button>
          </div>
        </div>
      </div>
      
      <div class="flex gap-4 glass p-3 rounded-2xl">
        <img src="https://images.unsplash.com/photo-1529042410759-befb1204b468" class="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover" />
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-bold">Shashlik assorti</h3>
            <p class="text-stone-400 text-sm leading-tight mt-1">Qiymali, jaz, jigar (1 por)</p>
          </div>
          <div class="flex justify-between items-center mt-2">
            <p class="text-amber-500 font-bold">55 000 UZS</p>
            <button class="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-bold" onclick="add('Shashlik assorti', 55000)">+</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sticky Footer -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-[#1c1917]/90 backdrop-blur border-t border-stone-800 flex justify-between items-center z-20">
      <div>
        <p class="text-sm text-stone-400">Jami summasi</p>
        <p class="text-xl font-bold text-amber-500" id="totalPrice">0 UZS</p>
      </div>
      <button class="bg-amber-600 px-6 py-3 rounded-xl font-bold btn shadow-lg shadow-amber-600/20" onclick="submitOrder()">Buyurtma</button>
    </div>
  </div>

  <script>
    let order = [];
    let total = 0;
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.expand();
      tg.MainButton.setText('Buyurtmani tasdiqlash');
      tg.MainButton.onClick(() => submitOrder());
    }

    function add(item, price) {
      order.push({item, price});
      total += price;
      document.getElementById('totalPrice').textContent = total.toLocaleString() + ' UZS';
      if(tg && total > 0) {
         tg.MainButton.show();
         tg.MainButton.setText('Tasdiqlash (' + total.toLocaleString() + ' UZS)');
      }
    }
    
    function submitOrder() {
      if(order.length === 0) return alert('Savat bo\\'sh!');
      if(tg) {
        tg.sendData(JSON.stringify({action: 'restaurant_order', order, total}));
      } else {
        alert('Buyurtma berildi: ' + total.toLocaleString() + ' UZS');
      }
    }
  </script>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    body { background: url('https://images.unsplash.com/photo-1557682250-33bd709cbe85') center/cover no-repeat fixed; margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; }
    .overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(10px); z-index: -1; }
    .glass { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    .btn { min-height: 50px; padding: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; }
  </style>
</head>
<body class="p-4">
  <div class="overlay"></div>
  <div class="glass w-full max-w-sm rounded-[32px] p-8 text-center text-white relative">
    <div class="absolute top-6 right-6">
      <div class="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
    </div>
    
    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a" class="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white/30 mb-5" />
    <h1 class="text-3xl font-bold mb-1 tracking-tight">Murod Aliyev</h1>
    <p class="text-blue-200 mb-2 font-medium text-lg">Mazaika CEO & Asoschisi</p>
    <p class="text-gray-300 text-sm mb-8 px-4">Innovatsion IT yechimlar va biznes avtomatlashtirish.</p>
    
    <div class="space-y-3 w-full">
      <a href="tel:+998901234567" class="w-full bg-white/10 hover:bg-white/20 rounded-2xl transition font-medium btn text-lg">
        📞 +998 90 123 45 67
      </a>
      <a href="mailto:murod@mazaika.uz" class="w-full bg-white/10 hover:bg-white/20 rounded-2xl transition font-medium btn text-lg">
        ✉️ Email yozish
      </a>
      <div class="flex gap-3 pt-2">
        <a href="https://t.me/username" class="flex-1 bg-[#229ED9]/80 hover:bg-[#229ED9] rounded-2xl transition font-medium btn">
          Telegram
        </a>
        <a href="https://instagram.com" class="flex-1 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-2xl transition font-medium btn">
          Instagram
        </a>
      </div>
      <button onclick="openMap()" class="w-full bg-white/10 hover:bg-white/20 rounded-2xl transition font-medium btn text-lg mt-2">
        📍 Manzil: Toshkent, Chilonzor
      </button>
    </div>
  </div>

  <script>
    const tg = window.Telegram?.WebApp;
    if (tg) tg.expand();

    function openMap() {
      if(tg && tg.openLink) {
        tg.openLink('https://maps.google.com/?q=Tashkent,Uzbekistan');
      } else {
        window.open('https://maps.google.com/?q=Tashkent,Uzbekistan', '_blank');
      }
    }
  </script>
</body>
</html>`
  }
];
