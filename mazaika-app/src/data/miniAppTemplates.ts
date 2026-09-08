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
</html>`  },
  {
    id: "spin-wheel",
    name: "Колесо Фортуны (Spin & Win)",
    html: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Колесо Фортуны — Mazaika Lucky Wheel</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    body {
      background: radial-gradient(circle at top, #1e1b4b 0%, #030712 100%);
      color: #fff;
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow-x: hidden;
      touch-action: manipulation;
    }
    .wheel-container {
      position: relative;
      width: 320px;
      height: 320px;
      margin: 0 auto;
    }
    canvas {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 0 25px rgba(245, 158, 11, 0.4));
    }
    .pointer {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 16px solid transparent;
      border-right: 16px solid transparent;
      border-top: 28px solid #F59E0B;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));
      z-index: 20;
    }
    .spin-center-btn {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: radial-gradient(circle, #F59E0B, #B45309);
      border: 3px solid #FEF3C7;
      color: #000;
      font-weight: 900;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.8), inset 0 2px 4px rgba(255,255,255,0.6);
      z-index: 30;
      transition: transform 0.15s;
    }
    .spin-center-btn:active {
      transform: translate(-50%, -50%) scale(0.92);
    }
    .glow-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(0, 245, 196, 0.4); }
      50% { box-shadow: 0 0 35px rgba(0, 245, 196, 0.8); }
    }
    .winning-banner {
      animation: pulse-glow 2s infinite;
    }
  </style>
</head>
<body class="p-4">
  <div class="w-full max-w-sm text-center flex flex-col items-center">
    <div class="mb-4">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
        🎰 Розыгрыш подарков
      </div>
      <h1 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200">
        Колесо Фортуны
      </h1>
      <p class="text-xs text-gray-400 mt-1">Крутите колесо и заберите свой приз!</p>
    </div>

    <!-- Wheel Element -->
    <div class="wheel-container my-2">
      <div class="pointer"></div>
      <canvas id="wheelCanvas" width="640" height="640"></canvas>
      <button id="spinBtn" class="spin-center-btn" onclick="spinWheel()">КРУТИТЬ</button>
    </div>

    <!-- Prize Result Container -->
    <div id="resultModal" class="hidden w-full mt-4 p-5 glow-card winning-banner text-center">
      <div class="text-3xl mb-1">🎉</div>
      <h2 class="text-lg font-bold text-amber-400">Поздравляем!</h2>
      <p id="prizeText" class="text-xl font-black text-white mt-1 mb-2"></p>
      <p class="text-xs text-gray-300 mb-3">Ваш секретный промокод: <span id="promoCode" class="font-mono bg-white/10 px-2 py-1 rounded text-cyan-300 font-bold"></span></p>
      <button onclick="claimPrize()" class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/30 active:scale-95 transition">
        Забрать подарок в боте
      </button>
    </div>
  </div>

  <script>
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.expand();
      tg.ready();
    }

    const segments = [
      { text: '-20% Скидка', color: '#EF4444', code: 'SALE20' },
      { text: 'Кофе в подарок', color: '#3B82F6', code: 'FREECOFFEE' },
      { text: '-10% Скидка', color: '#10B981', code: 'SALE10' },
      { text: 'Десерт бесплатно', color: '#8B5CF6', code: 'SWEET' },
      { text: 'Джекпот -50%', color: '#F59E0B', code: 'JACKPOT50' },
      { text: 'Бесплатная доставка', color: '#06B6D4', code: 'FREESHIP' }
    ];

    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    const totalSegments = segments.length;
    const arc = (2 * Math.PI) / totalSegments;
    let currentAngle = 0;
    let isSpinning = false;

    function drawWheel() {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.width / 2 - 20;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < totalSegments; i++) {
        const angle = currentAngle + i * arc;

        // Draw slice
        ctx.beginPath();
        ctx.fillStyle = segments[i].color;
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arc);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px -apple-system, sans-serif';
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = 'right';
        ctx.fillText(segments[i].text, radius - 40, 8);
        ctx.restore();
      }
    }

    drawWheel();

    let wonPrize = null;

    function spinWheel() {
      if (isSpinning) return;
      isSpinning = true;
      document.getElementById('resultModal').classList.add('hidden');
      if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');

      const winningIndex = Math.floor(Math.random() * totalSegments);
      wonPrize = segments[winningIndex];

      // Calculate target rotation (stop segment at top: 3*PI/2)
      const extraSpins = (5 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
      const targetAngle = (3 * Math.PI / 2) - (winningIndex * arc + arc / 2);
      const finalAngle = currentAngle + extraSpins + ((targetAngle - (currentAngle % (2 * Math.PI)) + 4 * Math.PI) % (2 * Math.PI));

      const startTime = performance.now();
      const spinDuration = 4500;
      const initialAngle = currentAngle;

      function animate(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        // Ease out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentAngle = initialAngle + (finalAngle - initialAngle) * easeOut;
        drawWheel();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          isSpinning = false;
          if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
          showResult(wonPrize);
        }
      }

      requestAnimationFrame(animate);
    }

    function showResult(prize) {
      document.getElementById('prizeText').textContent = prize.text;
      document.getElementById('promoCode').textContent = prize.code;
      document.getElementById('resultModal').classList.remove('hidden');
    }

    function claimPrize() {
      if (!wonPrize) return;
      if (tg?.sendData) {
        tg.sendData(JSON.stringify({
          action: 'lucky_wheel_prize',
          prize: wonPrize.text,
          promoCode: wonPrize.code
        }));
      } else {
        alert('Поздравляем! Ваш промокод ' + wonPrize.code + ' скопирован в буфер обмена.');
        navigator.clipboard?.writeText(wonPrize.code);
      }
    }
  </script>
</body>
</html>`
  },
  {
    id: "scratch-card",
    name: "Скретч-карта со скидкой",
    html: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Скретч-карта со скидкой</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>
  <style>
    body {
      background: radial-gradient(circle at top, #0f172a 0%, #020617 100%);
      color: #fff;
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      touch-action: none;
    }
    .card-wrap {
      position: relative;
      width: 320px;
      height: 200px;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1);
    }
    .prize-layer {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 16px;
      user-select: none;
    }
    canvas {
      position: absolute;
      inset: 0;
      cursor: crosshair;
      z-index: 10;
    }
    .glow-badge {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
  </style>
</head>
<body class="p-4">
  <div class="w-full max-w-sm text-center flex flex-col items-center">
    <div class="mb-4">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
        🎫 Моментальная лотерея
      </div>
      <h1 class="text-2xl font-black text-white">Сотри и выиграй!</h1>
      <p class="text-xs text-gray-400 mt-1">Проведите пальцем по карте, чтобы стереть защитный слой</p>
    </div>

    <!-- Scratch Ticket Card -->
    <div class="card-wrap my-3">
      <!-- Hidden Prize Layer -->
      <div class="prize-layer">
        <div class="text-3xl mb-1">🎁</div>
        <div class="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200">
          Скидка 25% НА ВСЁ!
        </div>
        <div class="text-xs text-gray-300 mt-1">Промокод на заказ:</div>
        <div class="text-lg font-mono font-black text-cyan-300 mt-1 bg-black/40 px-4 py-1 rounded-lg border border-cyan-500/40">
          MAZAIKA25
        </div>
      </div>

      <!-- Scratch Surface Canvas -->
      <canvas id="scratchCanvas" width="320" height="200"></canvas>
    </div>

    <!-- Progress & Action -->
    <div class="w-full mt-3">
      <div class="flex justify-between items-center text-xs text-gray-400 mb-1">
        <span>Прогресс стирания:</span>
        <span id="percentText" class="font-bold text-cyan-400">0%</span>
      </div>
      <div class="w-full bg-gray-800 rounded-full h-2 overflow-hidden mb-4 border border-white/5">
        <div id="progressBar" class="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-200" style="width: 0%"></div>
      </div>

      <button id="claimBtn" onclick="claimScratchReward()" disabled class="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold text-sm opacity-50 cursor-not-allowed transition duration-200 shadow-lg shadow-cyan-500/20">
        Сотрите карту для активации
      </button>
    </div>
  </div>

  <script>
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.expand();
      tg.ready();
    }

    const canvas = document.getElementById('scratchCanvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let scratchedPixels = 0;
    let totalPixels = canvas.width * canvas.height;
    let isRevealed = false;

    // Draw scratchable metallic surface
    function initCanvas() {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#94A3B8');
      grad.addColorStop(0.5, '#CBD5E1');
      grad.addColorStop(1, '#64748B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add silver texture & pattern
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 15px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✨ СОТРИТЕ ЗДЕСЬ ✨', canvas.width / 2, canvas.height / 2 + 5);
    }

    initCanvas();

    function scratch(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, 2 * Math.PI);
      ctx.fill();

      if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');

      checkScratchPercentage();
    }

    function checkScratchPercentage() {
      if (isRevealed) return;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparentCount = 0;
      const total = imageData.data.length / 4;

      // Sample every 16th pixel for high performance
      for (let i = 3; i < imageData.data.length; i += 64) {
        if (imageData.data[i] === 0) transparentCount++;
      }

      const percent = Math.min(100, Math.round((transparentCount / (total / 16)) * 100));
      document.getElementById('percentText').textContent = percent + '%';
      document.getElementById('progressBar').style.width = percent + '%';

      if (percent >= 45 && !isRevealed) {
        revealAll();
      }
    }

    function revealAll() {
      isRevealed = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.getElementById('percentText').textContent = '100%';
      document.getElementById('progressBar').style.width = '100%';
      const btn = document.getElementById('claimBtn');
      btn.disabled = false;
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
      btn.classList.add('active:scale-95', 'cursor-pointer');
      btn.textContent = '🎁 Использовать промокод MAZAIKA25';

      if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    }

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const { x, y } = getCoords(e);
      scratch(x, y);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const { x, y } = getCoords(e);
      scratch(x, y);
    });

    window.addEventListener('mouseup', () => { isDrawing = false; });

    canvas.addEventListener('touchstart', (e) => {
      isDrawing = true;
      const { x, y } = getCoords(e);
      scratch(x, y);
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (!isDrawing) return;
      const { x, y } = getCoords(e);
      scratch(x, y);
    }, { passive: true });

    canvas.addEventListener('touchend', () => { isDrawing = false; });

    function claimScratchReward() {
      if (tg?.sendData) {
        tg.sendData(JSON.stringify({
          action: 'scratch_card_claimed',
          promoCode: 'MAZAIKA25',
          discount: '25%'
        }));
      } else {
        alert('Промокод MAZAIKA25 скопирован в буфер обмена!');
        navigator.clipboard?.writeText('MAZAIKA25');
      }
    }
  </script>
</body>
</html>`
  }
];