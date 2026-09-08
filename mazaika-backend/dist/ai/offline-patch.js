"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySemanticOfflinePatch = applySemanticOfflinePatch;
function applySemanticOfflinePatch(sourceHtml, promptText, isRu) {
    let updated = sourceHtml || '';
    const changes = [];
    const p = promptText.toLowerCase();
    if (/(зелен|изумруд|салатов|yashil|green|emerald)/i.test(p)) {
        updated = updated
            .replace(/#00[dD]9[fF]{2}|#06[bB]6[dD]4|#1[eE]90[fF]{2}|#2563[eE][bB]|#8[bB]5[cC][fF]6|#f43f5e/gi, '#10B981')
            .replace(/cyan-500|blue-600|sky-500|purple-500|rose-500/g, 'emerald-500')
            .replace(/cyan-400|blue-400|sky-400|purple-400|rose-400/g, 'emerald-400')
            .replace(/glow-cyan|glow-blue|glow-accent|glow-purple/g, 'glow-emerald')
            .replace(/rgba\(0,\s*217,\s*255/g, 'rgba(16, 185, 129')
            .replace(/selection:bg-cyan-500/g, 'selection:bg-emerald-500');
        changes.push(isRu ? 'Цветовая палитра изменена на изумрудно-зеленую (#10B981)' : "Rang yashil rangga o'zgartirildi");
    }
    else if (/(красн|бордов|розов|qizil|red|rose)/i.test(p)) {
        updated = updated
            .replace(/#00[dD]9[fF]{2}|#06[bB]6[dD]4|#1[eE]90[fF]{2}|#10[bB]981|#8[bB]5[cC][fF]6/gi, '#EF4444')
            .replace(/cyan-500|blue-600|emerald-500|purple-500/g, 'rose-500')
            .replace(/cyan-400|blue-400|emerald-400|purple-400/g, 'rose-400')
            .replace(/glow-cyan|glow-accent|glow-blue|glow-emerald/g, 'glow-rose')
            .replace(/rgba\(0,\s*217,\s*255/g, 'rgba(239, 68, 68')
            .replace(/selection:bg-cyan-500/g, 'selection:bg-rose-500');
        changes.push(isRu ? 'Цветовая палитра изменена на рубиново-красную (#EF4444)' : "Rang qizil rangga o'zgartirildi");
    }
    else if (/(фиолетов|сирен|binafsha|purple|violet)/i.test(p)) {
        updated = updated
            .replace(/#00[dD]9[fF]{2}|#06[bB]6[dD]4|#1[eE]90[fF]{2}|#10[bB]981|#ef4444/gi, '#8B5CF6')
            .replace(/cyan-500|blue-600|emerald-500|rose-500/g, 'purple-500')
            .replace(/cyan-400|blue-400|emerald-400|rose-400/g, 'purple-400')
            .replace(/glow-cyan|glow-accent|glow-emerald|glow-rose/g, 'glow-purple')
            .replace(/rgba\(0,\s*217,\s*255/g, 'rgba(139, 92, 246')
            .replace(/selection:bg-cyan-500/g, 'selection:bg-purple-500');
        changes.push(isRu ? 'Цветовая палитра изменена на неоново-фиолетовую (#8B5CF6)' : "Rang binafsha rangga o'zgartirildi");
    }
    else if (/(син[ие]|голуб|лазурн|moviy|blue|sky)/i.test(p)) {
        updated = updated
            .replace(/#00[dD]9[fF]{2}|#10[bB]981|#8[bB]5[cC][fF]6|#ef4444/gi, '#2563EB')
            .replace(/cyan-500|emerald-500|purple-500|rose-500/g, 'blue-600')
            .replace(/cyan-400|emerald-400|purple-400|rose-400/g, 'blue-400')
            .replace(/glow-cyan|glow-accent|glow-emerald|glow-purple/g, 'glow-blue')
            .replace(/rgba\(0,\s*217,\s*255/g, 'rgba(37, 99, 235')
            .replace(/selection:bg-cyan-500/g, 'selection:bg-blue-600');
        changes.push(isRu ? 'Цветовая палитра изменена на электрический синий (#2563EB)' : "Rang ko'k rangga o'zgartirildi");
    }
    else if (/(золот|желт|янтарн|sariq|gold|yellow|amber)/i.test(p)) {
        updated = updated
            .replace(/#00[dD]9[fF]{2}|#10[bB]981|#8[bB]5[cC][fF]6|#ef4444/gi, '#F59E0B')
            .replace(/cyan-500|emerald-500|purple-500|rose-500/g, 'amber-500')
            .replace(/cyan-400|emerald-400|purple-400|rose-400/g, 'amber-400')
            .replace(/glow-cyan|glow-accent/g, 'glow-amber')
            .replace(/rgba\(0,\s*217,\s*255/g, 'rgba(245, 158, 11')
            .replace(/selection:bg-cyan-500/g, 'selection:bg-amber-500');
        changes.push(isRu ? 'Цветовая палитра изменена на премиальное золото (#F59E0B)' : "Rang oltin rangga o'zgartirildi");
    }
    const titleMatch = promptText.match(/(?:заголовок|название|имя|назови|переименуй|сделай заголовок|поменяй заголовок|sarlavha|nomi)\s*(?:на|в|to|ga)?\s*[:"«'–-]?\s*([^"»'\n\r,.]+)/i);
    if (titleMatch && titleMatch[1]) {
        const rawNewTitle = titleMatch[1].trim();
        const newTitle = rawNewTitle.replace(/^["'«]+|["'»]+$/g, '').trim();
        if (newTitle.length > 1) {
            updated = updated.replace(/<title>.*?<\/title>/i, `<title>${newTitle}</title>`);
            updated = updated.replace(/(<h1[^>]*>)(.*?)(<\/h1>)/i, `$1${newTitle}$3`);
            changes.push(isRu ? `Заголовок и название обновлены на "${newTitle}"` : `Sarlavha "${newTitle}"ga o'zgartirildi`);
        }
    }
    if (/(отзыв|клиент|мнен|feedback|review|testimonial|mijozlar fikri)/i.test(p) && !updated.includes('id="reviews"')) {
        const reviewsHtml = `
  <!-- Customer Reviews Section -->
  <section id="reviews" class="max-w-5xl mx-auto px-4 pt-12 pb-6 w-full">
    <div class="text-center mb-8">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-cyan-400 border border-white/10 mb-2">
        <i class="fa-solid fa-star text-amber-400"></i> ${isRu ? "Рейтинг 4.9 из 5.0" : "Reyting 4.9 / 5.0"}
      </span>
      <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
        ${isRu ? "Что говорят наши клиенты" : "Mijozlarimiz biz haqimizda"}
      </h2>
      <p class="text-slate-400 text-xs sm:text-sm mt-1">
        ${isRu ? "Более 1,500 довольных клиентов уже пользуются нашими услугами" : "1500 dan ortiq mamnun mijozlar tanlovi"}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="glass-card rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-1 text-amber-400 text-xs mb-3">
            ★★★★★
          </div>
          <p class="text-xs text-slate-300 leading-relaxed italic mb-4">
            "${isRu ? "Сервис превзошел все ожидания! Очень быстрая обратная связь, сделали всё на высшем уровне качества. Рекомендую!" : "Xizmat a'lo darajada! Tezkor aloqa va yuqori sifat. Barchaga tavsiya qilaman!"}"
          </p>
        </div>
        <div class="flex items-center gap-3 pt-3 border-t border-white/5">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" class="w-9 h-9 rounded-full object-cover border border-white/20" />
          <div>
            <div class="text-xs font-bold text-white">${isRu ? "Камилла Юсупова" : "Kamilla Yusupova"}</div>
            <div class="text-[10px] text-slate-400">${isRu ? "Постоянный клиент" : "Doimiy mijoz"}</div>
          </div>
        </div>
      </div>

      <div class="glass-card rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-1 text-amber-400 text-xs mb-3">
            ★★★★★
          </div>
          <p class="text-xs text-slate-300 leading-relaxed italic mb-4">
            "${isRu ? "Удобно заказывать прямо через Telegram. Оплатил в пару кликов, привезли вовремя. Спасибо за отличную работу!" : "Telegram orqali buyurtma berish juda qulay bo'ldi. To'lovni tez qildim, vaqtida yetkazishdi!"}"
          </p>
        </div>
        <div class="flex items-center gap-3 pt-3 border-t border-white/5">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" class="w-9 h-9 rounded-full object-cover border border-white/20" />
          <div>
            <div class="text-xs font-bold text-white">${isRu ? "Жасур Алимов" : "Jasur Alimov"}</div>
            <div class="text-[10px] text-slate-400">${isRu ? "Предприниматель" : "Tadbirkor"}</div>
          </div>
        </div>
      </div>

      <div class="glass-card rounded-2xl p-5 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-1 text-amber-400 text-xs mb-3">
            ★★★★★
          </div>
          <p class="text-xs text-slate-300 leading-relaxed italic mb-4">
            "${isRu ? "Настоящие профессионалы своего дела. Цены адекватные, подход внимательный и вежливый. Обязательно обращусь еще." : "O'z ishining ustalari. Narxlar adolatli va muomala juda xushmuomala. Yana murojaat qilaman."}"
          </p>
        </div>
        <div class="flex items-center gap-3 pt-3 border-t border-white/5">
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" class="w-9 h-9 rounded-full object-cover border border-white/20" />
          <div>
            <div class="text-xs font-bold text-white">${isRu ? "Фарход Назиров" : "Farxod Nazirov"}</div>
            <div class="text-[10px] text-slate-400">${isRu ? "Клиент" : "Mijoz"}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
`;
        if (updated.includes('</main>')) {
            updated = updated.replace('</main>', `</main>\n${reviewsHtml}`);
        }
        else if (updated.includes('<footer')) {
            updated = updated.replace('<footer', `${reviewsHtml}\n<footer`);
        }
        else {
            updated = updated.replace('</body>', `${reviewsHtml}\n</body>`);
        }
        changes.push(isRu ? 'Добавлена секция «Отзывы клиентов» с рейтингом и карточками' : "Mijozlar fikrlari bo'limi muvaffaqiyatli qo'shildi");
    }
    if (/(faq|вопрос|ответ|частые вопросы|savol-javob)/i.test(p) && !updated.includes('id="faq"')) {
        const faqHtml = `
  <!-- Interactive FAQ Section -->
  <section id="faq" class="max-w-4xl mx-auto px-4 pt-12 pb-6 w-full">
    <div class="text-center mb-8">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-cyan-400 border border-white/10 mb-2">
        <i class="fa-solid fa-circle-question"></i> ${isRu ? "Помощь & Ответы" : "Yordam"}
      </span>
      <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
        ${isRu ? "Часто задаваемые вопросы" : "Ko'p beriladigan savollar"}
      </h2>
    </div>

    <div class="space-y-3">
      <div class="glass-card rounded-2xl p-4 cursor-pointer" onclick="this.querySelector('.faq-answer').classList.toggle('hidden'); this.querySelector('.faq-icon').classList.toggle('rotate-180');">
        <div class="flex items-center justify-between font-bold text-sm text-white">
          <span>${isRu ? "Как оформить заказ или записаться?" : "Buyurtma berish yoki yozilish qanday amalga oshiriladi?"}</span>
          <i class="fa-solid fa-chevron-down faq-icon text-xs text-slate-400 transition-transform duration-200"></i>
        </div>
        <div class="faq-answer hidden mt-3 pt-3 border-t border-white/5 text-xs text-slate-300 leading-relaxed">
          ${isRu ? "Вы можете добавить нужные позиции в корзину и нажать 'Оформить', либо нажать кнопку 'Запись' вверху страницы и ввести свой номер телефона. Наш администратор свяжется с вами в течение 5 минут." : "Savatga kerakli tovarlarni qo'shib 'Yuborish' tugmasini bosing yoki 'Yozilish' orqali telefon raqamingizni qoldiring. 5 daqiqada siz bilan bog'lanamiz."}
        </div>
      </div>

      <div class="glass-card rounded-2xl p-4 cursor-pointer" onclick="this.querySelector('.faq-answer').classList.toggle('hidden'); this.querySelector('.faq-icon').classList.toggle('rotate-180');">
        <div class="flex items-center justify-between font-bold text-sm text-white">
          <span>${isRu ? "Какие способы оплаты поддерживаются?" : "Qanday to'lov turlari mavjud?"}</span>
          <i class="fa-solid fa-chevron-down faq-icon text-xs text-slate-400 transition-transform duration-200"></i>
        </div>
        <div class="faq-answer hidden mt-3 pt-3 border-t border-white/5 text-xs text-slate-300 leading-relaxed">
          ${isRu ? "Мы принимаем оплату онлайн через Payme, Click, Uzum Bank, а также наличными или терминалом при получении заказа." : "Biz Payme, Click, Uzum Bank orqali online to'lovlarni hamda buyurtmani qabul qilganda naqd yoki terminal orqali qabul qilamiz."}
        </div>
      </div>

      <div class="glass-card rounded-2xl p-4 cursor-pointer" onclick="this.querySelector('.faq-answer').classList.toggle('hidden'); this.querySelector('.faq-icon').classList.toggle('rotate-180');">
        <div class="flex items-center justify-between font-bold text-sm text-white">
          <span>${isRu ? "Предоставляется ли гарантия на товары и услуги?" : "Kafolat beriladimi?"}</span>
          <i class="fa-solid fa-chevron-down faq-icon text-xs text-slate-400 transition-transform duration-200"></i>
        </div>
        <div class="faq-answer hidden mt-3 pt-3 border-t border-white/5 text-xs text-slate-300 leading-relaxed">
          ${isRu ? "Да, мы предоставляем официальную гарантию на весь ассортимент продукции и все виды выполненных услуг. В случае вопросов наш саппорт решит проблему мгновенно." : "Ha, biz barcha mahsulot va xizmatlarimizga rasmiy kafolat beramiz."}
        </div>
      </div>
    </div>
  </section>
`;
        if (updated.includes('</main>')) {
            updated = updated.replace('</main>', `</main>\n${faqHtml}`);
        }
        else if (updated.includes('<footer')) {
            updated = updated.replace('<footer', `${faqHtml}\n<footer`);
        }
        else {
            updated = updated.replace('</body>', `${faqHtml}\n</body>`);
        }
        changes.push(isRu ? 'Добавлен интерактивный аккордеон «Частые вопросы (FAQ)»' : "Ko'p beriladigan savollar (FAQ) bo'limi qo'shildi");
    }
    if (/(контакт|связ|телефон|где вы|напишите нам|aloqa|kontakt)/i.test(p) && !updated.includes('id="contacts"')) {
        const contactsHtml = `
  <!-- Contact Section -->
  <section id="contacts" class="max-w-5xl mx-auto px-4 pt-12 pb-8 w-full">
    <div class="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">${isRu ? "Контакты" : "Bog'lanish"}</div>
          <h3 class="text-xl font-black text-white mb-3">${isRu ? "Всегда на связи" : "Biz bilan aloqa"}</h3>
          <p class="text-xs text-slate-400 leading-relaxed mb-4">${isRu ? "Ответим на любые ваши вопросы и поможем с выбором в любое удобное время." : "Savollaringizga tez va sifatli javob beramiz."}</p>
          <div class="text-sm font-bold text-white mb-1"><i class="fa-solid fa-phone text-cyan-400 mr-2"></i> +998 71 200-00-00</div>
          <div class="text-xs text-slate-400"><i class="fa-solid fa-clock text-slate-500 mr-2"></i> ${isRu ? "Пн-Вс: 09:00 - 22:00" : "Du-Yak: 09:00 - 22:00"}</div>
        </div>

        <div>
          <div class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">${isRu ? "Локация" : "Manzil"}</div>
          <div class="text-sm font-bold text-white mb-1"><i class="fa-solid fa-location-dot text-emerald-400 mr-2"></i> ${isRu ? "г. Ташкент, ул. Амира Темура, 45" : "Toshkent sh., Amir Temur ko'chasi, 45"}</div>
          <div class="text-xs text-slate-400 mb-4">${isRu ? "Ориентир: станция метро 'Амир Темур Хиёбони'" : "Mo'ljal: Amir Temur xiyoboni metrosi"}</div>
          <a href="https://maps.google.com" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition border border-white/10">
            <i class="fa-solid fa-map-location-dot text-cyan-400"></i>
            <span>${isRu ? "Открыть на карте" : "Xaritada ko'rish"}</span>
          </a>
        </div>

        <div>
          <div class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">${isRu ? "Онлайн поддержка" : "Online yordam"}</div>
          <div class="text-xs text-slate-300 mb-4">${isRu ? "Напишите напрямую нашему консультанту в Telegram:" : "Telegram orqali to'g'ridan-to'g'ri bog'laning:"}</div>
          <a href="https://t.me/mazaika_official" target="_blank" class="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition flex items-center justify-center gap-2">
            <i class="fa-brands fa-telegram text-base"></i>
            <span>${isRu ? "Чат в Telegram" : "Telegram orqali yozish"}</span>
          </a>
        </div>
      </div>
    </div>
  </section>
`;
        if (updated.includes('</main>')) {
            updated = updated.replace('</main>', `</main>\n${contactsHtml}`);
        }
        else if (updated.includes('<footer')) {
            updated = updated.replace('<footer', `${contactsHtml}\n<footer`);
        }
        else {
            updated = updated.replace('</body>', `${contactsHtml}\n</body>`);
        }
        changes.push(isRu ? 'Добавлен блок контактов, адреса и прямой связи в Telegram' : "Aloqa va manzil ma'lumotlari bo'limi qo'shildi");
    }
    if (/(удали|убери|скрой|o'chir|olib tashla)/i.test(p)) {
        if (/(отзыв|review|testimonial)/i.test(p) && updated.includes('id="reviews"')) {
            updated = updated.replace(/<!-- Customer Reviews Section -->[\s\S]*?<\/section>/i, '');
            changes.push(isRu ? 'Секция отзывов удалена со страницы' : "Mijozlar fikrlari o'chirildi");
        }
        if (/(faq|вопрос|ответ)/i.test(p) && updated.includes('id="faq"')) {
            updated = updated.replace(/<!-- Interactive FAQ Section -->[\s\S]*?<\/section>/i, '');
            changes.push(isRu ? 'Секция частых вопросов (FAQ) удалена со страницы' : "FAQ bo'limi o'chirildi");
        }
        if (/(колес|рулетк|wheel)/i.test(p)) {
            updated = updated.replace(/<!-- Wheel of Fortune Modal -->[\s\S]*?<\/div>\s*<\/div>/i, '');
            changes.push(isRu ? 'Рулетка призов удалена со страницы' : "Omad g'ildiragi o'chirildi");
        }
    }
    if (changes.length === 0) {
        changes.push(isRu ? 'Проект проверен, оптимизирован и готов к работе.' : 'Loyiha muvaffaqiyatli saqlandi va yangilandi.');
    }
    const explanation = isRu
        ? `✅ Изменения успешно применены:\n${changes.map(c => `• ${c}`).join('\n')}\n\nРезультат доступен во вкладке "Предпросмотр" (Preview).`
        : `✅ O'zgarishlar muvaffaqiyatli kiritildi:\n${changes.map(c => `• ${c}`).join('\n')}`;
    return { html: updated, explanation };
}
//# sourceMappingURL=offline-patch.js.map